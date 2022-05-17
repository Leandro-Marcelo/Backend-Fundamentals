const express = require("express");
const User = require("../services/users");
const ROLES_LIST = require("../config/rolesList");
const verifyRoles = require("../middleware/verifyRoles");

function users(app) {
    const router = express.Router();
    const usersService = new User();
    app.use("/api/users", router);

    router.get(
        "/",
        verifyRoles(ROLES_LIST.admin, ROLES_LIST.applicant),
        async (req, res) => {
            const response = await usersService.getAll();

            if (response.success) {
                return res.status(response.status).json(response.data);
            }

            return res.status(response.status).json(response.message);
        }
    );

    router.put(
        "/updateUsername/:id",
        verifyRoles(ROLES_LIST.admin, ROLES_LIST.user),
        async (req, res) => {
            const {
                body: { data },
            } = req;
            const updatedUser = await usersService.updateUser(
                req.params.id,
                data
            );

            return res.json({ updatedUser });
        }
    );

    router.delete("/:id", verifyRoles(ROLES_LIST.admin), async (req, res) => {
        const deletedUser = await usersService.delete(req.params.id);

        return res.json({ deletedUser });
    });

    router.get(
        "/changeRole",
        verifyRoles(
            ROLES_LIST.admin,
            ROLES_LIST.employer,
            ROLES_LIST.applicant,
            ROLES_LIST.user
        ),
        async (req, res) => {
            const {
                body: { newRole },
                user: { id, roles },
            } = req;

            const updatedUser = await usersService.changeRole(
                id,
                roles,
                newRole
            );
            return res.status(200).json(updatedUser);
        }
    );

    router.get("/xd", async (req, res) => {
        const response = await usersService.xd();

        return res.json({ response });
    });

    router.get(
        "/:id",
        verifyRoles(
            ROLES_LIST.admin,
            ROLES_LIST.employer,
            ROLES_LIST.applicant,
            ROLES_LIST.user
        ),
        async (req, res) => {
            const user = await usersService.get(req.params.id);

            return res.status(200).json(user);
        }
    );
}

module.exports = users;
