const database = require("../database");
class EventController {
    async read(id) {
        const user = await database.query("SELECT * FROM users where id=?", [
            id,
        ]);
        return user[0];
    }

    async readAll() {
        const users = await database.query("SELECT * FROM users");
        return users;
    }

    async create(user) {
        const results = await database.insert("users", user);
        return results;
    }

    async edit(id, data) {
        const user = await database.query("UPDATE users SET ? WHERE id=?", [
            data,
            id,
        ]);
        return user;
    }

    async delete(id) {
        const user = await database.del("users", id);
        return user;
    }
}

module.exports = EventController;
