const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { access_token_secret, refresh_token_secret } = require("../config");
const UserModel = require("../models/user");

const handleLogin = async (req, res) => {
    const { user: credentialsUser, pwd: credentialsPwd } = req.body;

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

    //Unauthorized
    if (!foundUser) return res.sendStatus(401);

    // evaluate password
    const match = await bcrypt.compare(credentialsPwd, foundUser.password);
    if (match) {
        // create JWTs and roles
        const roles = Object.values(foundUser.roles);
        const accessToken = jwt.sign(
            {
                userInfo: {
                    username: foundUser.username,
                    roles,
                },
            },
            access_token_secret,
            { expiresIn: "30s" } // 5 minutes to 15 minutes on production
        );
        const refreshToken = jwt.sign(
            { username: foundUser.username },
            refresh_token_secret,
            { expiresIn: "1d" }
        );
        // Saving refreshToken with current user
        foundUser.refreshToken = refreshToken;
        const result = await foundUser.save();

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
