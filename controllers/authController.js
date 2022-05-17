const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { access_token_secret, refresh_token_secret } = require("../config");
const UserModel = require("../models/user");

const handleLogin = async (req, res) => {
    const {
        cookies,
        body: { user: credentialsUser },
        body: { pwd: credentialsPwd },
    } = req;

    /*  console.log(`cookie available at login: ${JSON.stringify(cookies)}`); */

    if (!credentialsUser || !credentialsPwd)
        return (
            res
                //400 Bad Request
                .status(400)
                .json({ message: "Username and password are required." })
        );

    const foundUser = await UserModel.findOne({
        username: credentialsUser,
    }).exec();
    console.log(credentialsUser);
    console.log(credentialsPwd);
    if (!foundUser) return res.sendStatus(401); //Unauthorized

    // evaluate password
    const match = await bcrypt.compare(credentialsPwd, foundUser.password);
    if (match) {
        const roles = Object.values(foundUser.roles);
        const accessToken = jwt.sign(
            {
                userInfo: {
                    username: foundUser.username,
                    roles,
                },
            },
            access_token_secret,
            { expiresIn: "15s" } // 5 minutes to 15 minutes on production
        );
        const newRefreshToken = jwt.sign(
            { username: foundUser.username },
            refresh_token_secret,
            { expiresIn: "10s" }
        );

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
            const foundToken = await UserModel.findOne({
                refreshTokenOfCookies,
            }).exec(); // si el token expiro pues va a seguir ahí, por lo que simplemente le borramos el refreshToken que se encuentra en su cookie y le regresamos un refreshToken nuevo

            // Detected refresh token reuse!
            if (!foundToken) {
                console.log("attempted refresh token reuse at login!"); // esto lo va activar el usuario y eso significa que alguien mas utilizó su rT por eso es que no existe, entonces procedemos a eliminar todos refreshTokens de su cuenta, le limpiamos la cookie y le asignamos una cookie nueva
                // clear out ALL previous refresh tokens
                newRefreshTokenArray = [];
            }

            res.clearCookie("jwt", {
                httpOnly: true,
                sameSite: "None",
                secure: true,
            });
        }

        // Saving refreshToken with current user
        foundUser.refreshTokens = [...newRefreshTokenArray, newRefreshToken];
        const result = await foundUser.save();

        // Creates Secure Cookie with refresh token
        res.cookie("jwt", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 24 * 60 * 60 * 1000,
        });

        // Send authorization roles and access token to user
        res.json({ roles, accessToken });
    } else {
        res.sendStatus(401);
    }
};

module.exports = { handleLogin };
