const jwt = require("jsonwebtoken");
const { access_token_secret } = require("../config");

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    // 401 Unauthorized
    console.log(`entro aca`);
    if (!authHeader) return res.sendStatus(401);
    console.log(authHeader); // Bearer token
    const token = authHeader.split(" ")[1];
    jwt.verify(token, access_token_secret, (err, decoded) => {
        // 403 forbidden, which means you are forbidden from accessing
        if (err) return res.sendStatus(403); // invalid token
        req.user = decoded.username;
        next();
    });
};

module.exports = verifyJWT;
