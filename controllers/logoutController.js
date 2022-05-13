const UserModel = require("../models/user");

const handleLogout = async (req, res) => {
    // On client, also delete the accessToken

    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //No content
    const refreshToken = cookies.jwt;

    // Is refreshToken in db?
    const foundUser = UserModel.findOne({
        refreshToken,
    }).exec();

    // Esto es porque puede suceder de que tiene un refreshtoken sin embargo, no esta en la base de datos porque es un refreshtoken de otra aplicación por lo tanto, se la limpio
    // O sea tenia una cookie y llego hasta acá pero como es que puede suceder eso, si mal no recuerdo Tzuzul decía que los backend podían leer tus cookies. En ese caso las cookies se comparten
    if (!foundUser) {
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
        });
        return res.sendStatus(204);
    }

    // Delete refreshToken in db
    foundUser.refreshToken = "";
    // if I remember correctly, the advantage of save is that if it does not exist, it creates it and if it does exist, it updates it.
    const result = await foundUser.save();

    // secure: true - only serves on https
    res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
    });
    res.sendStatus(204);
};

module.exports = { handleLogout };
