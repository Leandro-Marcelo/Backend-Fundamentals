//Usando modulos nátivos:
const path = require("path");
const express = require("express");
const config = require("./config");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const session = require("express-session");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const addSessionToTemplate = require("./middleware/addSessionToTemplate");

//Importando router
const users = require("./routes/users"); // También podemos usar: require("./routes/users.js")
const auth = require("./routes/auth");

const app = express();

/* ************************************************************ Middleware **************************************/

/* Custom Middleware logger */
app.use(logger);

/* Cross Origin Resource Sharing */

app.use(cors(corsOptions));
app.use(express.json());
//serve static files
//Middleware para servir archivos estaticos
app.use("/static", express.static(path.join(__dirname, "static")));
/* app.use("/", express.static(path.join(__dirname, "static"))); esto es lo mismo que poner app.use(express.static(path.join(__dirname, "static")))  esto quiere decir que si desde /* me manda a 404.html va a utilizar los estilos de statick sin embargo los subdirectorios no podrán, al específicarlo de que los static estarán en /static eso significa que mientras esos archivos esten ahí, todas las routes podrán consumirlas. */

// built-in middleware to handle urlencoded data form data
// "content-type: application/x-www-form-urlencoded'
/* esto es para ver el contenido que llega desde el formulario, ya que si no esta este middleware nos trae puros undefined */
app.use(express.urlencoded({ extended: false }));

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

// built-in middleware for json
app.use(addSessionToTemplate);
// built-in middleware for json
app.use("/employees", require("./routes/api/employees"));
// Sección de codigo para los router
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
