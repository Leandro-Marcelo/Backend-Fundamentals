const express = require("express");
const Jobs = require("../services/jobs");
const ROLES_LIST = require("../config/rolesList");
const verifyRoles = require("../middleware/verifyRoles");
const { isRegular } = require("../middleware/auth");

function jobs(app) {
    const router = express.Router();
    const jobsService = new Jobs();
    app.use("/api/jobs", router);

    router.get(
        "/",
        verifyRoles(ROLES_LIST.admin, ROLES_LIST.reclutador),
        async (req, res) => {
            const response = await jobsService.getAll();

            return res.json(response);
        }
    );

    router.post("/apply", isRegular, async (req, res) => {
        console.log(req.user);
        const response = await jobsService.apply();

        return res.json(response);
    });

    router.post(
        "/",
        verifyRoles(ROLES_LIST.admin, ROLES_LIST.reclutador),
        async (req, res) => {
            const response = await jobsService.create(req.body);

            return res.json(response);
        }
    );
}

module.exports = users;
