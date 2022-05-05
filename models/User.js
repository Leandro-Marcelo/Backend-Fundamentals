const { query, insert } = require("../config/database");

class User {
    userId;
    constructor(user) {
        this.name = user.name;
        this.username = user.username;
        this.email = user.email;
        /* envia desde el form algo así '2022-03-21T00:50' */
        this.birthday = user.birthday;
        this.profilePic = user.profilePic;
        this.password = user.password;
        this.passwordRepeated = user.passwordRepeated;
    }

    static async read(id) {
        const user = await database.query("SELECT * FROM users where id=?", [
            id,
        ]);
        return user[0];
    }

    static async readAll() {
        const users = await database.query("SELECT * FROM users");
        return users;
    }

    static async create(user) {
        const results = await database.insert("users", user);
        return results;
    }

    static async edit(id, data) {
        const user = await database.query("UPDATE users SET ? WHERE id=?", [
            data,
            id,
        ]);
        return user;
    }

    static async delete(id) {
        const user = await database.del("users", id);
        return user;
    }

    async save() {
        const newUser = {
            name: this.name,
            email: this.email,
            username: this.username,
            birthday: this.birthday,
            profile_pic: this.profilePic,
            password: this.password,
        };

        try {
            const result = await query(`INSERT INTO users(??) VALUES(?)`, [
                Object.keys(newUser),
                Object.values(newUser),
            ]);
            /* esto imprimiria ResultSetHeader{fieldCount:0, affectedRows:1, insertId:54, info:"", serverStatus:2, warningStatus:0} como podemos ver, podemos ver el id que le puso al usuario*/
            /* console.log(result); */
            /* devolvemos el id que le asigno al momento de crear al usuario */
            console.log(`created user`);
            console.log(newUser);
            return {
                success: true,
                userId: result.insertId,
                username: this.username,
            };
        } catch (error) {
            return { error, success: false };
        }
    }

    static async getByEmail(email) {
        const userData = await query("SELECT * FROM users WHERE email=?", [
            email,
        ]);
        return userData;
    }

    validate() {
        let result = { success: true, errors: [] };
        if (
            !(
                this.name &&
                this.username &&
                this.email &&
                this.password &&
                this.passwordRepeated
            )
        ) {
            result.success = false;
            result.errors.push("Rellena todos los campos");
        }
        if (this.password !== this.passwordRepeated) {
            result.success = false;
            result.errors.push("Las contraseñas no coinciden");
        }
        return result;
    }
}

module.exports = User;
