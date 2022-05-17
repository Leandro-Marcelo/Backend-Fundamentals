const jwt = require("jsonwebtoken");
const { access_token_secret, refresh_token_secret } = require("../config");
const UserModel = require("../models/user");

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401); // 401 Unauthorized
    const refreshTokenOfCookies = cookies.jwt; // de cookies o de http only cookies

    res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
    });

    console.log(`refresh token que envio`, refreshTokenOfCookies);
    const foundUser = await UserModel.findOne({
        refreshTokens: refreshTokenOfCookies,
    }).exec();
    console.log(foundUser);

    // Detected refresh token reuse!
    if (!foundUser) {
        jwt.verify(
            refreshTokenOfCookies,
            refresh_token_secret,
            async (err, decoded) => {
                if (err) return res.sendStatus(403); // Si el token se llama igual pero no lo emitimos nosotros entonces devolvemos un 403:Forbidden
                console.log("attempted refresh token reuse!");
                const hackedUser = await UserModel.findOne({
                    username: decoded.username,
                }).exec();
                hackedUser.refreshTokens = []; // haciendo que todos tengan que volver a logearse
                const result = await hackedUser.save();
                console.log(result);
            }
        );
        return res.sendStatus(403); // Forbidden
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
                const result = await foundUser.save();
            }
            if (err || foundUser.username !== decoded.username)
                return res.sendStatus(403); // si existe otro error o si no coincide el foundedUser.username con el username decodificado del token

            // Refresh token was still valid
            const roles = Object.values(foundUser.roles);
            const accessToken = jwt.sign(
                {
                    userInfo: {
                        username: decoded.username,
                        roles,
                    },
                },
                access_token_secret,
                { expiresIn: "10s" } // 5 minutes to 15 minutes on production
            );

            const newRefreshToken = jwt.sign(
                { username: foundUser.username }, // ya que el refresh token es el mas expuesto, incluso le crearía un id nuevo mas que ponerle el username no?
                refresh_token_secret,
                { expiresIn: "15s" }
            );

            // Saving refreshToken with current user
            foundUser.refreshTokens = [
                ...newRefreshTokenArray,
                newRefreshToken,
            ];
            const result = await foundUser.save();

            console.log(`Old Refresh Token`, refreshTokenOfCookies);
            console.log(`New Refresh Token`, newRefreshToken);

            // Creates Secure Cookie with refresh token
            res.cookie("jwt", newRefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "None",
                maxAge: 24 * 60 * 60 * 1000,
            });

            res.json({ roles, accessToken }); // el role dijo que no hacía falta mandarlo y que de ayuda de una librería iba a poder decodificar el access token o algo así
        }
    );
};

module.exports = { handleRefreshToken };
