const express = require("express");
const UserController = require("../controllers/users");
const router = express.Router();
const userController = new UserController();
const path = require("path");
/* Preguntar sobre la arquitectura y routes */

/* router.get("/", userController.getUsersView); */

/* router.get("^/$|/index(.html)?", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "index.html"));
}); */

module.exports = router;
