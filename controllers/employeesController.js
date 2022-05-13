/* let's have the data object set like this and if you work with react I'm thinking in more of reactful way when I do this */

const data = {
    employees: require("../models/employees.json"),
    setEmployees: function (data) {
        this.employees = data;
    },
};

const getAllEmployees = (req, res) => {
    return res.json(data.employees);
};

const createNewEmployee = (req, res) => {
    const newEmployee = {
        id: data.employees[data.employees.length - 1].id + 1 || 1,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
    };

    if (!newEmployee.firstname || !newEmployee.lastname) {
        return res
            .status(400)
            .json({ message: "First and last names are required." });
    }

    data.setEmployees([...data.employees, newEmployee]);
    res.status(201).json(data.employees);
};

const updateEmployee = (req, res) => {
    const {
        body: { id, firstname, lastname },
    } = req;

    const employee = data.employees.find(
        (employee) => employee.id === parseInt(id)
    );
    if (!employee) {
        return (
            res
                /* The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing). */
                .status(400)
                .json({ message: `Employee ID ${id} not found ` })
        );
    }
    if (firstname) employee.firstname = firstname;
    if (lastname) employee.lastname = lastname;

    const filteredArray = data.employees.filter(
        (employee) => employee.id !== parseInt(id)
    );
    const unsortedArray = [...filteredArray, employee];
    data.setEmployees(
        unsortedArray.sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0))
    );
    res.json(data.employees);
};

const deleteEmployee = (req, res) => {
    const {
        body: { id },
    } = req;

    const employee = data.employees.find(
        (employee) => employee.id === parseInt(id)
    );
    if (!employee) {
        return res.status(400).json({ message: `Employee ID ${id} not found` });
    }

    const filteredArray = data.employees.filter(
        (employee) => employee.id !== parseInt(id)
    );

    data.setEmployees([...filteredArray]);
    res.json(data.employees);
};

const getEmployee = (req, res) => {
    const employee = data.employees.find(
        (employee) => employee.id === parseInt(req.params.id)
    );

    if (!employee) {
        return res
            .status(400)
            .json({ message: `Employee ID ${req.params.id} not found` });
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
