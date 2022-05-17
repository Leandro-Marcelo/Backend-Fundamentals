const UserModel = require("../models/user");

const handleLogout = async (req, res) => {
    // On client, also delete the accessToken

    const cookies = req.cookies;
    /* if (!cookies?.jwt) return res.sendStatus(204); //No content */
    if (!cookies?.jwt)
        return res.json({
            message: "does not have a refresh token",
            status: 204,
        });
    const refreshTokenOfCookies = cookies.jwt;

    // Is refreshToken in db?
    const foundUser = UserModel.findOne({
        refreshTokenOfCookies,
    }).exec();

    // Esto es porque puede suceder de que tiene un refreshtoken sin embargo, no esta en la base de datos porque es un refreshtoken de otra aplicación por lo tanto, se la limpio y le envio un mensaje de que no puede deslogearse
    // O sea tenia una cookie y llego hasta acá pero como es que puede suceder eso, si mal no recuerdo Tzuzul decía que los backend podían leer tus cookies. En ese caso las cookies se comparten
    if (!foundUser) {
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
        });
        /* return res.sendStatus(204); */
        return res.json({
            message:
                "you cannot logout because the refresh token does not exist in the database",
            status: 204,
        });
    }

    // Delete refreshToken in db
    foundUser.refreshTokens = foundUser.refreshTokens.filter(
        (refreshToken) => refreshToken !== refreshTokenOfCookies
    );
    // if I remember correctly, the advantage of save is that if it does not exist, it creates it and if it does exist, it updates it.
    const result = await foundUser.save();

    // secure: true - only serves on https
    res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
    });
    /* res.sendStatus(204); */
    res.json({ success: true, status: 204 });
};

module.exports = { handleLogout };
