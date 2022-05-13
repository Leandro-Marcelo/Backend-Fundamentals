// ...allowedRoles = (5150, 1984, 2001)
const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req?.roles) return res.sendStatus(401); // unauthorized
        const rolesArray = [...allowedRoles];
        const result = req.roles
            .map((role) => rolesArray.includes(role))
            .find((values) => values === true);
        console.log(`aaa`, result);
        if (!result) return res.sendStatus(401); // unauthorized
        next();
    };
};

module.exports = verifyRoles;
