const jwt = require("jsonwebtoken");
const { access_token_secret, refresh_token_secret } = require("../config");
const UserModel = require("../models/user");

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    const foundUser = await UserModel.findOne({
        refreshToken,
    }).exec();

    if (!foundUser) return res.sendStatus(403); //Forbidden
    // evaluate jwt
    jwt.verify(refreshToken, refresh_token_secret, (err, decoded) => {
        if (err || foundUser.username !== decoded.username)
            return res.sendStatus(403);
        const roles = Object.values(foundUser.roles);
        const accessToken = jwt.sign(
            {
                userInfo: {
                    username: decoded.username,
                    roles: roles,
                },
            },
            access_token_secret,
            { expiresIn: "30s" } // 5 minutes to 15 minutes on production
        );
        res.json({ accessToken });
    });
};

module.exports = { handleRefreshToken };
