const express = require("express");
const router = express.Router();
const usersController = require("../../controllers/usersController");
const ROLES_LIST = require("../../config/rolesList");
const verifyRoles = require("../../middleware/verifyRoles");

router
    .route("/")
    .get(verifyRoles(ROLES_LIST.admin), usersController.getAllUsers)
    .delete(verifyRoles(ROLES_LIST.admin), usersController.deleteUser);

router
    .route("/:id")
    .get(verifyRoles(ROLES_LIST.admin), usersController.getUser);

module.exports = router;
