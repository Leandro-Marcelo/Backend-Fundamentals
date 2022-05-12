const usersDB = {
    users: require("../models/users.json"),
    setUsers: function (data) {
        this.users = data;
    },
};
const fsPromises = require("fs").promises;
const path = require("path");

const handleLogout = async (req, res) => {
    // On client, also delete the accessToken

    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //No content
    const refreshToken = cookies.jwt;

    // Is refreshToken in db?
    const foundUser = usersDB.users.find(
        (user) => user.refreshToken === refreshToken
    );

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
    const otherUsers = usersDB.users.filter(
        (user) => user.refreshToken !== foundUser.refreshToken
    );
    const currentUser = { ...foundUser, refreshToken: "" };
    usersDB.setUsers([...otherUsers, currentUser]);
    await fsPromises.writeFile(
        path.join(__dirname, "..", "model", "users.json"),
        JSON.stringify(usersDB.users)
    );

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
