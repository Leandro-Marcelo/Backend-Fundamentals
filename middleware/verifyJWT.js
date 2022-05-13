const jwt = require("jsonwebtoken");
const { access_token_secret } = require("../config");

const verifyJWT = (req, res, next) => {
    /*   console.log(req.headers); */
    const authHeader = req.headers["authorization"];
    /*  console.log(authHeader); */
    // 401 Unauthorized
    // este ?. actuaría como un or, so,first of all if we do have an off header or if it starts with this ("Bearer ")
    if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);
    /*    console.log(authHeader); // Bearer token */
    const token = authHeader.split(" ")[1];
    jwt.verify(token, access_token_secret, (err, decoded) => {
        // 403 forbidden, which means you are forbidden from accessing
        if (err) return res.sendStatus(403); // invalid token
        req.user = decoded.userInfo.username;
        req.roles = decoded.userInfo.roles;
        next();
    });
};

module.exports = verifyJWT;
