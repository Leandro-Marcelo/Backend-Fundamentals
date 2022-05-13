const UserModel = require("../models/user");

const bcrypt = require("bcrypt");

const handleNewUser = async (req, res) => {
    const { user: credentialsUser, pwd: credentialsPwd } = req.body;

    if (!credentialsUser || !credentialsPwd)
        return (
            res
                //400 Bad Request
                .status(400)
                .json({ message: "Username and password are required." })
        );

    // check for duplicate usernames in the db
    const duplicate = await UserModel.findOne({
        username: credentialsUser,
    }).exec();

    if (duplicate) {
        // 409 Conflict
        return res.sendStatus(409); //return: Conflict (in text)
    }

    try {
        // encrypt the password
        const hashedPwd = await bcrypt.hash(credentialsPwd, 10);
        // create and store the new user
        const newUser = await UserModel.create({
            username: credentialsUser,
            password: hashedPwd,
            // roles: { User: 2001 }, no ponemos el role predeterminado por que ya definimos el default data en nuestro esquema, gracias a mongoose
        });

        // 201 Created
        res.status(201).json({
            success: `New user ${credentialsUser} created!`,
        });
    } catch (err) {
        //500 Internal Server Error
        res.status(500).json({ message: err.message });
    }
};

module.exports = { handleNewUser };
