const jwt = require("jsonwebtoken");
const { access_token_secret, refresh_token_secret } = require("../config");
const usersDB = {
    users: require("../models/users.json"),
    setUsers: function (data) {
        this.users = data;
    },
};

const handleRefreshToken = (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    const foundUser = usersDB.users.find(
        (user) => user.refreshToken === refreshToken
    );
    if (!foundUser) return res.sendStatus(403); //Forbidden
    // evaluate jwt
    jwt.verify(refreshToken, refresh_token_secret, (err, decoded) => {
        if (err || foundUser.username !== decoded.username)
            return res.sendStatus(403);
        const accessToken = jwt.sign(
            { username: decoded.username },
            access_token_secret,
            { expiresIn: "30s" } // 5 minutes to 15 minutes on production
        );
        res.json({ accessToken });
    });
};

module.exports = { handleRefreshToken };
