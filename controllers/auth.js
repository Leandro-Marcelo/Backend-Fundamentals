const User = require("../models/User");
const path = require("path");
class AuthController {
    getLoginView(req, res) {
        return res.sendFile(path.join(__dirname, "..", "views", "login.html"));
    }

    getSignUpView(req, res) {
        return res.sendFile(path.join(__dirname, "..", "views", "signup.html"));
    }

    logOut(req, res) {
        req.session.destroy();
        return res.redirect("/login");
    }

    async logIn(req, res) {
        const { email, password } = req.body;
        const user = await User.getByEmail(email);
        if (user.length === 0) {
            //como el success esta vacio, allá por tener la negación se pasa a true y muestra este errors
            /* return res.render("login", {
                validation: { errors: ["Usuario no registrado"] },
            }); */
            console.log(`Usuario no registrado`);
            return res.redirect("/login");
        }
        if (user[0].password !== password) {
            /* return res.render("login", {
                validation: {
                    errors: ["El usuario o la clave son incorrectos"],
                },
            }); */
            console.log(`El usuario o la clave son incorrectos`);
            return res.redirect("/login");
        }

        /* el setHeader("Set-cookie","loggedIn=true") podemos agregarle fecha de expiración, etc. Basicamente, es lo mismo que hace una cookie, define un header y guarda la cookie */
        /* return res.setHeader("Set-Cookie", "loggedIn=true").redirect("/"); */
        /* Ahora utilizando el session, lo que hacemos acá es guardar la propiedad loggedIn en el session del usuario */
        req.session.loggedIn = true;
        req.session.username = user[0].username;
        /* no se puede poner req.session.id porque al parecer express-session guarda un id de tipo objeto por lo que tira error */
        req.session.userId = user[0].id;
        return res.redirect("/");
    }

    async signUp(req, res) {
        const newUser = new User(req.body);
        const validation = newUser.validate();
        if (validation.success) {
            /* este .save(), miralo como cuando le aplicas upperCase a algo, tipo sabes que se lo esta aplicando al que esta a su izquierda, es como concatenas metodos */
            const registeredUser = await newUser.save();
            if (registeredUser.success) {
                req.session.loggedIn = registeredUser.success;
                req.session.username = registeredUser.username;
                /* no se puede poner req.session.id porque al parecer express-session guarda un id de tipo objeto por lo que tira error */
                req.session.userId = registeredUser.userId;
                return res.redirect("/");
                /* este else es una validación en caso de que, haya rellenado todos los campos, por lo que paso la primera validación sin embargo, no se pudo guardar en la base de datos por err.duplicate.entry por lo que gestionamos el error y lo mostramos en la UI */
            } else {
                /* validation.errors = [registeredUser.error];
                validation.success = registeredUser.success; */
                console.log(registeredUser.error);
                /* validation = {success:false, errors:["el correo electrónico ya esta en uso"]} no se puede hacer porque definimos la variable como const */
                return res.redirect("/signup");
            }
        }
        /* este return es para mostrar el error y rellenarle los campos */
        /* return res.render("signup", { validation, user: newUser }); */
    }
}

module.exports = AuthController;
