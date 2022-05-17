const UserModel = require("../models/user");
const bcrypt = require("bcrypt");
const rolesList = require("../config/rolesList");
class Users {
    async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    }

    async get(id) {
        const user = await UserModel.findById(id);
        return user;
    }

    async getByEmail(email) {
        if (email) {
            const user = await UserModel.findOne({ email: email });
            return user;
        }
    }

    async getByFilter(filter) {
        const user = await UserModel.findOne(
            filter,
            {},
            { strict: false } // es para que me retorne si es exactamente igual y no de que es una parte del coso, entonces me lo devuelve todo
        );

        return user;
    }

    /* async xd() {
        const refreshToken = await UserModel.findOne(
            {
                refreshToken: "ARk",
            },
            {},
            { strict: false }
        ).exec();
        return refreshToken;
    } */

    async updateById(userId, data) {
        const user = await UserModel.findByIdAndUpdate(userId, data, {
            new: true,
        });
        return user;
    }

    async getAll() {
        // find devuelve varios elementos
        const users = await UserModel.find();
        return { success: true, data: users, status: 200 };
    }

    async create(data) {
        const user = await UserModel.create(data);
        /*  const { username } = user; */
        return user;
    }

    /* id del usuario de la sesión, id del usuario a editar y la data a modificar de ese usuario anterior, lo normal sería que cada vez que se actualiza, debe poner su password, en este caso si actualiza la contraseña, hasheamos esa contraseña, y si no la actualiza la dejamos tal cual */
    async update(loggedUserId, userId, data) {
        /* Este if es para validar si esta editando su cuenta, es decir, el envía su id y si el id que quiere editar es igual a su id entonces se cumple y procede a editarse en la base de datos ó si es admin, entonces tambien*/
        /* cuando agreguemos rol, este tendría que ser un ó loggedUserId === userId || data.isAdmin */
        if (loggedUserId === userId) {
            if (data.password) {
                data.password = await this.hashPassword(data.password);
            }
        } else {
            return {
                success: false,
                message: "You can update only your account!",
            };
        }
        const updatedUser = await UserModel.findByIdAndUpdate(userId, data, {
            new: true,
        });
        return {
            success: true,
            updatedUser,
            message: "Account has been updated",
        };
    }

    /* update data */
    async updateUsername(userId, username) {
        const user = await UserModel.findByIdAndUpdate(
            userId,
            { username },
            {
                new: true,
            }
        );
        return user;
    }

    async delete(id) {
        const user = await UserModel.findByIdAndDelete(id);
        return user;
    }

    async changeRole(userId, userRoles, newRole) {
        if (newRole === "user") {
            return {
                message: "No puedes asignarte el rol de user",
                status: 403,
            };
        }

        if (newRole === "admin") {
            const rolesArray = [400];
            const result = userRoles
                .map((role) => rolesArray.includes(role))
                .find((values) => values === true);

            if (!result) {
                return {
                    message: "No posees el rol de admin para esa request",
                    status: 403,
                };
            }
        }
        const foundRole = rolesList[newRole];

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { roles: foundRole },
            {
                new: true,
            }
        );
        return updatedUser;
    }
}

module.exports = Users;
