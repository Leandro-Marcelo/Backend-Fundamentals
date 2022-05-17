const UserModel = require("../models/user");

const getAllUsers = async (req, res) => {
    const users = await UserModel.find();
    if (!users) return res.status(204).json({ message: "No users found" });
    res.json(users);
};

const deleteUser = async (req, res) => {
    if (!req?.body?.id)
        return res.status(400).json({ message: "User ID required" });
    const user = await UserModel.findOne({ _id: req.body.id }).exec();
    if (!user) {
        return res
            .status(204)
            .json({ message: `User ID ${req.body.id} not found` });
    }
    const result = await UserModel.deleteOne({ _id: req.body.id });
    res.json(result);
};

const getUser = async (req, res) => {
    if (!req?.params?.id)
        return res.status(400).json({ message: "User ID required" });
    const user = await UserModel.findOne({ _id: req.params.id }).exec();
    if (!user) {
        return res
            .status(204)
            .json({ message: `User ID ${req.params.id} not found` });
    }
    res.json(user);
};

module.exports = {
    getAllUsers,
    deleteUser,
    getUser,
};
