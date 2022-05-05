//Usando modulos nátivos:
const path = require("path");
const express = require("express");
const config = require("./config");
const session = require("express-session");

//Importando router
const users = require("./routes/users"); // También podemos usar: require("./routes/users.js")
const auth = require("./routes/auth");
const addSessionToTemplate = require("./middleware/addSessionToTemplate");

const app = express();

//Sección para los middleware
app.use("/static", express.static(path.join(__dirname, "static"))); //Middleware para archivos estaticos
/* esto es para ver el contenido que llega desde el formulario, ya que si no esta este middleware nos trae puros undefined */
app.use(express.urlencoded({ extended: true }));

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

app.use(addSessionToTemplate);
app.use(express.json());

// Sección de codigo para los router
app.use(users); // Usando un router
app.use(auth); // Usando un router

/* app.get("/", (req, res) => {
    //cuando hacemos sendFile(index.html, no se aplicaban los styles), ahora utilizando el middleware podemos incrustrarle CSS
    return res.sendFile(path.join(__dirname, "views", "index.html"));
}); */

app.listen(config.port, () => {
    console.log("Mode:", process.env.NODE_ENV);
    console.log("listening on: http://localhost:" + config.port);
});
