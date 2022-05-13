// Importando o requeriendo de modulos nátivos, es decir, modulos que ya viene establecidos en NodeJS
const path = require("path");
const express = require("express");
const config = require("./config");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const verifyJWT = require("./middleware/verifyJWT");
const cookieParser = require("cookie-parser");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");

const credentials = require("./middleware/credentials");

const app = express();

// custom middleware logger
app.use(logger);

// Handle options credentials check-before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
// "content-type: application/x-www-form-urlencoded'
/* esto es para ver el contenido que llega desde el formulario, ya que si no esta este middleware nos trae puros undefined */
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

// Conexión con la base de datos
const { connection } = require("./config/db");
connection();

// Serve static files
app.use("/static", express.static(path.join(__dirname, "static")));
/* app.use("/", express.static(path.join(__dirname, "static"))); esto es lo mismo que poner app.use(express.static(path.join(__dirname, "static")))  esto quiere decir que si desde /* me manda a 404.html va a utilizar los estilos de statick sin embargo los subdirectorios no podrán, al específicarlo de que los static estarán en /static eso significa que mientras esos archivos esten ahí, todas las routes podrán consumirlas. */

// routes
app.use("/api/register", require("./routes/api/register"));
app.use("/api/auth", require("./routes/api/auth"));
/* el refresh token no puede ir por debajo del verifyJWT porque se supone que no tenemos access_token porque expiró */
app.use("/api/refresh", require("./routes/api/refresh"));
app.use("/api/logout", require("./routes/api/logout"));

app.use(verifyJWT);
app.use("/employees", require("./routes/api/employees"));
/* app.use("/", require("./routes/root")); */

app.all("*", (req, res) => {
    res.status(404);
    if (req.accepts("html")) {
        res.sendFile(path.join(__dirname, "views", "404.html"));
    } else if (req.accepts("json")) {
        res.json({ error: "404 Not Found" });
    } else {
        res.type("txt").send("404 Not Found");
    }
});

/* app.use which is for middleware and does not accept regex and app.all is more for routing and it will apply to all http methods at once */
app.use(errorHandler);

app.listen(config.port, () => {
    console.log("Mode:", process.env.NODE_ENV);
    console.log("listening on: http://localhost:" + config.port);
});
