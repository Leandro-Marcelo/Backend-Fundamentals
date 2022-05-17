/* let's have the data object set like this and if you work with react I'm thinking in more of reactful way when I do this */

const EmployeeModel = require("../models/employee");

const getAllEmployees = async (req, res) => {
    console.log(`que onda`);
    const employees = await EmployeeModel.find();
    if (!employees)
        return res.status(204).json({ message: "No employees found." });
    return res.json(employees);
};

const createNewEmployee = async (req, res) => {
    if (!req?.body?.firstname || !req?.body?.lastname) {
        return res
            .status(400)
            .json({ message: "First and last names are required" });
    }

    try {
        const result = await EmployeeModel.create({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
        });
        res.status(201).json(result);
    } catch (err) {
        console.error(err);
    }
};

const updateEmployee = async (req, res) => {
    if (!req?.body?.id) {
        return res.status(400).json({ message: "ID parameter is required." });
    }

    const employee = await EmployeeModel.findOne({ _id: req.body.id }).exec();
    if (!employee) {
        return res
            .status(204)
            .json({ message: `No employee matches ID ${req.body.id}.` });
    }
    if (req.body?.firstname) employee.firstname = req.body.firstname;
    if (req.body?.lastname) employee.lastname = req.body.lastname;
    const result = await employee.save();
    res.json(result);
};

const deleteEmployee = async (req, res) => {
    console.log(req.body.id);
    if (!req?.body?.id)
        return res.status(400).json({ message: "Employee ID required." });
    const employee = await EmployeeModel.findOne({
        _id: req.body.id,
    }).exec();

    if (!employee) {
        /*  return res.status(204).json({ la: "la" }); */
        return (
            res
                /* si envio un status(204) el cual significa no content, e intento enviar un .json({ }) este no se va a enviar */
                .status(204)
                .json({ message: `No employee matches ID ${req.body.id}.` })
        );
    }

    const result = await employee.deleteOne({ _id: req.body.id });
    res.json(result);
};

const getEmployee = async (req, res) => {
    if (!req?.params?.id)
        return res.status(400).json({ message: "Employee ID required." });
    const employee = await EmployeeModel.findOne({ _id: req.params.id }).exec();
    if (!employee) {
        return res
            .status(204)
            .json({ message: `No employee matches ID ${req.params.id}.` });
    }
    res.json(employee);
};

module.exports = {
    getAllEmployees,
    createNewEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployee,
};
