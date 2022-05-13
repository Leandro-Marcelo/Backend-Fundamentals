// Importando o requeriendo de modulos nátivos, es decir, modulos que ya viene establecidos en NodeJS
const path = require("path");
const express = require("express");
const config = require("./config");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const session = require("express-session");
const verifyJWT = require("./middleware/verifyJWT");
const cookieParser = require("cookie-parser");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const addSessionToTemplate = require("./middleware/addSessionToTemplate");
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

// Serve static files
app.use("/static", express.static(path.join(__dirname, "static")));
/* app.use("/", express.static(path.join(__dirname, "static"))); esto es lo mismo que poner app.use(express.static(path.join(__dirname, "static")))  esto quiere decir que si desde /* me manda a 404.html va a utilizar los estilos de statick sin embargo los subdirectorios no podrán, al específicarlo de que los static estarán en /static eso significa que mientras esos archivos esten ahí, todas las routes podrán consumirlas. */

app.use(
    /* generalmente siempre lo pondrán así. Un secret, resave:false, saveUninitialized:false para express session */
    session({
        /* digamos que añade una forma para decifrar la información que se esta guardando en la sesión, recuerda que esa sesión se guarda en el servidor, digamos que es como para que solamente yo tenga acceso a la información que esta ahí */
        secret: config.secret,
        /* guardan las sesiones que no estan modificadas de regreso al store. Basicamente es como decirle cada vez que se reciba una petición que la vuelva a guardar en el store, pues eso puede causar problemas de rendimiento, por eso lo ponemos en false. Al indicarlo como false, solamente cuando algo en la sesión cambió, que vuelva a guardar esa sesión  */
        resave: false,
        /* Va muy relacionado con el punto anterior, esto dice que solo vamos a guardar la información que sea inisializado, esta opción nos asegura que si no se a inisializado una sesión que no se guarde. (si no se ha logeado o registrado, que no se guarde nada en el store) */
        saveUninitialized: false,
    })
);

// built-in middleware for session
app.use(addSessionToTemplate);

// routes
app.use("/api/register", require("./routes/api/register"));
app.use("/api/auth", require("./routes/api/auth"));
/* el refresh token no puede ir por debajo del verifyJWT porque se supone que no tenemos access_token porque expiró */
app.use("/api/refresh", require("./routes/api/refresh"));
app.use("/api/logout", require("./routes/api/logout"));

app.use(verifyJWT);
app.use("/employees", require("./routes/api/employees"));

// Importando router
const users = require("./routes/users");
const auth = require("./routes/auth");

// Utilizando las rutas
app.use(users);
app.use(auth);

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
