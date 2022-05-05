const express = require("express");
const UserController = require("../controllers/users");
const router = express.Router();
const userController = new UserController();
/* Preguntar sobre la arquitectura y routes */

router.get("/", userController.getUsersView);

module.exports = router;
