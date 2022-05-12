const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { access_token_secret, refresh_token_secret } = require("../config");
const fsPromises = require("fs").promises;
const path = require("path");
const usersDB = {
    users: require("../models/users.json"),
    setUsers: function (data) {
        this.users = data;
    },
};

const handleLogin = async (req, res) => {
    const { user: credentialsUser, pwd: credentialsPwd } = req.body;

    if (!credentialsUser || !credentialsPwd)
        return (
            res
                //400 Bad Request
                .status(400)
                .json({ message: "Username and password are required." })
        );

    const foundUser = usersDB.users.find(
        (user) => user.username === credentialsUser
    );

    //Unauthorized
    if (!foundUser) return res.sendStatus(401);

    // evaluate password
    const match = await bcrypt.compare(credentialsPwd, foundUser.password);
    if (match) {
        // create JWTs
        const accessToken = jwt.sign(
            { username: foundUser.username },
            access_token_secret,
            { expiresIn: "30s" } // 5 minutes to 15 minutes on production
        );
        const refreshToken = jwt.sign(
            { username: foundUser.username },
            refresh_token_secret,
            { expiresIn: "1d" }
        );
        // Saving refreshToken with current user
        const otherUsers = usersDB.users.filter(
            (user) => user.username !== foundUser.username
        );
        const currentUser = { ...foundUser, refreshToken };
        usersDB.setUsers([...otherUsers, currentUser]);
        await fsPromises.writeFile(
            path.join(__dirname, "..", "models", "users.json"),
            JSON.stringify(usersDB.users)
        );
        res.cookie("jwt", refreshToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000, // equivale a 1d en milisegundos
        });
        res.json({ accessToken });
    } else {
        res.sendStatus(401);
    }
};

module.exports = { handleLogin };
