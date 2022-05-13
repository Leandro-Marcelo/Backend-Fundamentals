const { mongoose } = require("../config/db");

const { Schema } = mongoose;

const employeeSchema = new Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
});

const EmployeeModel = mongoose.model("employees", employeeSchema);

module.exports = EmployeeModel;
