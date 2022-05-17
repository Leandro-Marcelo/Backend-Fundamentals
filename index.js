const express = require("express");
const config = require("./config");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const verifyJWT = require("./middleware/verifyJWT");
const cookieParser = require("cookie-parser");

const credentials = require("./middleware/credentials");

// Importando routers
const auth = require("./routes/auth");
const users = require("./routes/users");

const app = express();

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

// routes
/* app.use("/api/register", require("./routes/api/register"));
app.use("/api/auth", require("./routes/api/auth")); */
/* el refresh token no puede ir por debajo del verifyJWT porque se supone que no tenemos access_token porque expiró */
/* app.use("/api/refresh", require("./routes/api/refresh"));
app.use("/api/logout", require("./routes/api/logout")); */

// Utilizando las rutas
auth(app);

/* files(app); */

app.use(verifyJWT);
users(app);
/* app.use("/api/employees", require("./routes/api/employees"));
app.use("/api/users", require("./routes/api/users")); */

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

app.listen(config.port, () => {
    console.log("Mode:", process.env.NODE_ENV);
    console.log("listening on: http://localhost:" + config.port);
});
