const usersDB = {
    users: require("../models/users.json"),
    setUsers: function (data) {
        this.users = data;
    },
};
const fsPromises = require("fs").promises;
const path = require("path");
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
    const duplicate = usersDB.users.find(
        (user) => user.username === credentialsUser
    );

    if (duplicate) {
        // 409 Conflict
        return res.sendStatus(409); //return: Conflict (in text)
    }

    try {
        //encrypt the password
        const hashedPwd = await bcrypt.hash(credentialsPwd, 10);
        //store the new user
        const newUser = {
            username: credentialsUser,
            password: hashedPwd,
            roles: { User: 2001 },
        };
        usersDB.setUsers([...usersDB.users, newUser]);
        // una vez ya actualiza usersDB, ahora sobreescribe toda esa DB por esta nueva
        await fsPromises.writeFile(
            path.join(__dirname, "..", "models", "users.json"),
            JSON.stringify(usersDB.users)
        );

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
