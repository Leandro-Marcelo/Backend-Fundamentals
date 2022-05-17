const jwt = require("jsonwebtoken");
const { access_token_secret } = require("../config");

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    // 401 Unauthorized
    // este ?. actuaría como un or, so,first of all if we do have an off header or if it starts with this ("Bearer ")

    if (!authHeader?.startsWith("Bearer "))
        return res.status(401).json({ message: "No posee un refreshToken" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, access_token_secret, (err, decoded) => {
        // 403 forbidden, which means you are forbidden from accessing
        if (err) return res.sendStatus(403); // invalid token
        req.user = decoded;

        next();
    });
};

module.exports = verifyJWT;
