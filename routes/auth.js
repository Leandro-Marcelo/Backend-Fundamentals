const express = require("express");
const Auth = require("../services/auth");
const handleTokenToCookie = require("../helpers/handleTokenToCookie");

function auth(app) {
    const router = express.Router();
    const authService = new Auth();
    app.use("/api/auth", router);

    router.post("/login", async (req, res) => {
        const {
            cookies,
            body: { email, password },
        } = req;
        const response = await authService.login(email, password, cookies);

        if (response.success) {
            console.log(response.instructions);
            return handleTokenToCookie(res, response);
        }

        return res.status(response.status).json(response.message);
    });

    router.post("/signup", async (req, res) => {
        const {
            body: { email, password, username },
        } = req;
        console.log(email, password, username);
        const response = await authService.signup(username, email, password);

        if (response.success) {
            return res.status(response.status).json(response.newUser);
            /* return tokenToCookie(res, response); */
        }

        return res.status(response.status).json(response.message); // "this.hashPassword is not a function"
    });

    router.get("/logout", async (req, res) => {
        const { cookies } = req;
        const response = await authService.logout(cookies);

        return handleTokenToCookie(res, response);
    });

    router.get("/refresh", async (req, res) => {
        const { cookies } = req;

        const response = await authService.refresh(cookies);

        if (response.success) {
            console.log(response.instructions);
            return handleTokenToCookie(res, response);
        }

        return res.status(response.status).json(response.message);
    });

    /*     router.post("/logout", (req, res) => {
        return res
            .cookie("token", "", {
                httpOnly: true,
                sameSite: "none",
                secure: true,
                expires: new Date(),
            })
            .json({ success: true });
    });
    router.post("/validate", isRegular, (req, res) => {
        return res.json({ success: true, user: req.user });
    }); */
}

module.exports = auth;
