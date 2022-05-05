const express = require("express");
const AuthController = require("../controllers/auth");

const router = express.Router();
const authController = new AuthController();

router.get("/login", authController.getLoginView);
router.get("/signup", authController.getSignUpView);
router.get("/logout", authController.logOut);
router.post("/login", authController.logIn);
router.post("/signup", authController.signUp);

module.exports = router;
