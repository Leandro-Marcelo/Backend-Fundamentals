const Users = require("./users"); //  servicio de Users
const jwt = require("jsonwebtoken");
const { access_token_secret, refresh_token_secret } = require("../config");
const bcrypt = require("bcrypt");

class Auth {
    constructor() {
        this.users = new Users();
    }

    // esto se podría modularizar o pongo esto tanto acá como en user, tipo en user tambien debería ir ya que si un usuario actualiza su contraseña esta debe ser nuevamente hasheada no?
    async #hashPassword(password) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            return hash;
        } catch (err) {
            console.log(err);
        }
    }

    #getTokens(foundUser) {
        const accessToken = jwt.sign(
            {
                id: foundUser._id,
                username: foundUser.username,
                email: foundUser.email,
                roles: foundUser.roles,
            },
            access_token_secret,
            { expiresIn: "1d" } // 5 minutes to 15 minutes on production
        );
        const newRefreshToken = jwt.sign(
            { username: foundUser.username },
            refresh_token_secret, // ya que el refresh token es el mas expuesto, incluso le crearía un id nuevo mas que ponerle el username no?
            { expiresIn: "1d" }
        );

        return { accessToken, newRefreshToken };
    }

    async login(credentialsEmail, credentialsPwd, cookies) {
        /*  console.log(`cookie available at login: ${JSON.stringify(cookies)}`); */

        if (!credentialsEmail || !credentialsPwd)
            return {
                success: false,
                message: "Username and password are required.",
                status: 400, //400 Bad Request
            };

        const foundUser = await this.users.getByFilter({
            email: credentialsEmail,
        });

        if (!foundUser)
            return {
                success: false,
                message: "Usuario No registrado",
                status: 401, //Unauthorized
            };

        let instructions = [];

        // evaluate password
        const match = await bcrypt.compare(credentialsPwd, foundUser.password);
        if (match) {
            const { accessToken, newRefreshToken } = this.#getTokens(foundUser);

            // Changed to let keyword
            let newRefreshTokenArray = !cookies?.jwt
                ? foundUser.refreshTokens
                : foundUser.refreshTokens.filter((rt) => rt !== cookies.jwt);

            if (cookies?.jwt) {
                /* 
            Scenario added here: 
                1) User logs in but never uses RT and does not logout 
                2) RT is stolen
                3) If 1 & 2, reuse detection is needed to clear all RTs when user logs in
            */
                const refreshTokenOfCookies = cookies.jwt;
                const foundToken = await this.users.getByFilter({
                    refreshToken: refreshTokenOfCookies,
                });
                // si el token expiro pues va a seguir ahí, por lo que simplemente le borramos el refreshToken que se encuentra en su cookie y le regresamos un refreshToken nuevo

                // Detected refresh token reuse!
                if (!foundToken) {
                    console.log("attempted refresh token reuse at login!"); // esto lo va activar el usuario y eso significa que alguien mas utilizó su rT por eso es que no existe, entonces procedemos a eliminar todos refreshTokens de su cuenta, le limpiamos la cookie y le asignamos una cookie nueva
                    // clear out ALL previous refresh tokens
                    newRefreshTokenArray = [];
                }

                instructions.push({ action: "clearCookie" });
            }

            // Saving refreshToken with current user
            foundUser.refreshTokens = [
                ...newRefreshTokenArray,
                newRefreshToken,
            ];

            const { _id, username, email, roles, createdAt, updatedAt } =
                await this.users.updateById(foundUser._id, foundUser);

            instructions.push({
                action: "addCookie",
                newRefreshToken,
                user: { _id, username, email, roles, createdAt, updatedAt },
                accessToken,
            });

            return { success: true, instructions, status: 200 };
        } else {
            return {
                success: false,
                message: "Contraseña incorrecta",
                status: 401,
            };
        }
    }

    async signup(credentialsUsername, credentialsEmail, credentialsPwd) {
        if (!credentialsEmail || !credentialsPwd || !credentialsUsername)
            return {
                success: false,
                message: "Username and password are required.",
                status: 400,
            };

        // check for duplicate usernames in the db
        const duplicate = await this.users.getByFilter({
            email: credentialsEmail,
        });

        if (duplicate) {
            return {
                success: false,
                message: `${credentialsEmail} is already a Job Search account. Try another email.`,
                status: 409,
            };
        }

        try {
            // encrypt the password
            const hashedPwd = await this.#hashPassword(credentialsPwd);
            // create and store the new user
            const newUser = await this.users.create({
                email: credentialsEmail,
                password: hashedPwd,
                username: credentialsUsername,
                roles: [100],
                // roles: { User: 2001 }, no ponemos el role predeterminado por que ya definimos el default data en nuestro esquema, gracias a mongoose
            });

            return { success: true, newUser, status: 201 };
        } catch (err) {
            return { success: false, message: err.message, status: 500 }; //500 Internal Server Error
        }
    }

    async logout(cookies) {
        // On client, also delete the accessToken

        let instructions = [];

        /* if (!cookies?.jwt) return res.sendStatus(204); //No content */
        if (!cookies?.jwt) {
            instructions.push({
                action: "clearCookieAndReturnJson",
                message: "does not have a refresh token",
            }); // no es necesario que limpie la cookie, pero quiero aprovechar el helpers
            return { instructions, status: 204 };
        }

        const refreshTokenOfCookies = cookies.jwt;

        // Is refreshToken in db?
        const foundUser = await this.users.getByFilter({
            refreshTokens: refreshTokenOfCookies,
        });

        // Esto es porque puede suceder de que tiene un refreshtoken sin embargo, no esta en la base de datos porque es un refreshtoken de otra aplicación por lo tanto, se la limpio y le envio un mensaje de que no puede deslogearse
        // O sea tenia una cookie y llego hasta acá pero como es que puede suceder eso, si mal no recuerdo Tzuzul decía que los backend podían leer tus cookies. En ese caso las cookies se comparten
        if (!foundUser) {
            instructions.push({
                action: "clearCookieAndReturnJson",
                message:
                    "you cannot logout because the refresh token does not exist in the database",
            });
            return { instructions, status: 204 };
        }

        // Delete refreshToken in db
        foundUser.refreshTokens = foundUser.refreshTokens.filter(
            (refreshToken) => refreshToken !== refreshTokenOfCookies
        );
        // if I remember correctly, the advantage of save is that if it does not exist, it creates it and if it does exist, it updates it.
        const result = await this.users.updateById(foundUser._id, foundUser);

        instructions.push({
            action: "clearCookieAndReturnJson",
            message: "deslogeado",
        });

        return { instructions, status: 204 };
    }

    async refresh(cookies) {
        let instructions = [];

        if (!cookies?.jwt)
            return {
                success: false,
                message: "no tiene refresh token o cookie",
                status: 401,
            }; // 401 Unauthorized
        const refreshTokenOfCookies = cookies.jwt; // de cookies o de http only cookies

        instructions.push({ action: "clearCookie" });

        const foundUser = await this.users.getByFilter({
            refreshTokens: refreshTokenOfCookies,
        });

        // Detected refresh token reuse!
        if (!foundUser) {
            jwt.verify(
                refreshTokenOfCookies,
                refresh_token_secret,
                async (err, decoded) => {
                    if (err)
                        return {
                            success: false,
                            message: "Token no emitido por nosotros",
                            status: 403,
                        }; // Si el token se llama igual pero no lo emitimos nosotros entonces devolvemos un 403:Forbidden
                    console.log("attempted refresh token reuse!");
                    const hackedUser = await this.users.getByFilter({
                        username: decoded.username,
                    });

                    hackedUser.refreshTokens = []; // haciendo que todos tengan que volver a logearse
                    const result = await this.users.updateById(
                        hackedUser._id,
                        hackedUser
                    );
                }
            );
            return {
                success: false,
                message: "attempted refresh token reuse! y ó hackedUser",
                status: 403,
            }; // Forbidden
        }

        const newRefreshTokenArray = foundUser.refreshTokens.filter(
            (refreshToken) => refreshToken !== refreshTokenOfCookies
        );

        // evaluate jwt
        jwt.verify(
            refreshTokenOfCookies,
            refresh_token_secret,
            async (err, decoded) => {
                if (err) {
                    console.log("expired refresh token");
                    foundUser.refreshTokens = [...newRefreshTokenArray];
                    const result = await this.users.updateById(
                        foundUser._id,
                        foundUser
                    );
                }
                if (err || foundUser.username !== decoded.username)
                    return { success: false, message: "error", status: 403 }; // si existe otro error o si no coincide el foundedUser.username con el username decodificado del token
            }
        );
        // Refresh token was still valid

        const { accessToken, newRefreshToken } = this.#getTokens(foundUser);

        console.log(accessToken, newRefreshToken);

        // Saving refreshToken with current user
        foundUser.refreshTokens = [...newRefreshTokenArray, newRefreshToken];

        const result = await this.users.updateById(foundUser._id, foundUser);

        /*         console.log(`Old Refresh Token`, refreshTokenOfCookies);
                console.log(`New Refresh Token`, newRefreshToken); */

        // Creates Secure Cookie with refresh token
        instructions.push({
            action: "addCookie",
            newRefreshToken,
            accessToken,
        });

        return { success: true, instructions, status: 200 };
    }
}

module.exports = Auth;
