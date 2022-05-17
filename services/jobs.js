const JobModel = require("../models/job");
const ApplicationService = require("./application");
class Jobs {
    async getAll() {
        const jobs = await JobModel.find();
        return jobs;
    }

    async get(jobId) {
        const job = await JobModel.find({ _id: jobId }).populate({
            path: "applicants",
            populate: { path: "applicant", model: "users" },
        });

        return job;
    }

    async create(data) {
        const jobs = await JobModel.create(data);
        return jobs;
    }

    async delete(id) {
        const jobs = await JobModel.findByIdAndDelete(id);
        return jobs;
    }

    async apply(jobId, applicationInformation) {
        /* para no tener que estar instanciando podemos hacerlo en el constructor */
        const applicationService = new ApplicationService();
        const application = await applicationService.create(
            applicationInformation
        );
        /* No agregamos validaciones para el resultado, si se modificó correctamente, se agrego y todo */
        const result = await JobModel.updateOne(
            { _id: jobId },
            { $push: { applicants: application.id } }
        );
        return application;
    }
}

module.exports = Jobs;
