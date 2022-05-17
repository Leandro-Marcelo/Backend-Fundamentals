// ...allowedRoles = (5150, 1984, 2001)
const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req?.user?.roles)
            return res.status(401).json({ message: "No posees roles" }); // unauthorized
        const rolesArray = [...allowedRoles];
        const result = req.user.roles
            .map((role) => rolesArray.includes(role))
            .find((values) => values === true);

        if (!result)
            return res.status(401).json({
                message: "No posees el rol necesario para esa request",
            }); // unauthorized
        next();
    };
};

module.exports = verifyRoles;
