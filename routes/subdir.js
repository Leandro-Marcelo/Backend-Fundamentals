const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/new-page(.html)?", (req, res) => {
    res.sendFile(
        path.join(__dirname, "..", "views", "subdir", "new-page.html")
    );
});

/* I'm specifying two options with regular expressions = ^/re$|regular-expresion.html */
/* (.html)? I'm specifying that "dot.html" is opcional*/
router.get("^/re$|regular-expresion(.html)?", (req, res) => {
    return res
        .status(200)
        .sendFile(
            path.join(
                __dirname,
                "..",
                "/views",
                "subdir",
                "regular-expresion.html"
            )
        );
});

router.get(
    "/chain(.html)?",
    (req, res, next) => {
        console.log(`attempted to load hello.html`);
        next();
    },
    (req, res) => {
        return res.send("Hello World!");
    }
);

const one = (req, res, next) => {
    console.log(`one`);
    next();
};

const two = (req, res, next) => {
    console.log(`two`);
    next();
};

const three = (req, res, next) => {
    console.log(`three`);
    console.log(`finished`);
    next();
};

router.get("/hello-upgraded", [one, two, three], (req, res) => {
    return res.send("hello world, middleware");
});

/* Express handles these routes like a waterfall, so: */
/* * that's kinda like if you're used to writing sql a "select all" */
/* router.get("/*", (req, res) => {
    return res
        .status(404)
        .sendFile(path.join(__dirname, "..", "/views", "404.html"));
}); */

router.get("/*", (req, res) => {
    console.log(`desde acá`);
    res.status(404).sendFile(path.join(__dirname, "..", "views", "404.html"));
});

module.exports = router;
