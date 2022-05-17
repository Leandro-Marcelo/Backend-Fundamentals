const JobModel = require("../models/job");
class Application {
    async create(data) {
        const applicant = await JobModel.create(data);
        return applicant;
    }

    async delete(id) {
        const jobs = await UserModel.findByIdAndDelete(id);
        return jobs;
    }

    async apply(jobId, applicationInformation) {
        /* para no tener que estar instanciando podemos hacerlo en el constructor */
        const listService = new ListService();
        const list = await listService.create(listData);
        /* No agregamos validaciones para el resultado, si se modificó correctamente, se agrego y todo */
        const result = await TeamModel.updateOne(
            { _id: idTeam },
            { $push: { lists: list.id } }
        );
        return list;
    }
}

module.exports = Application;
