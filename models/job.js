const { mongoose } = require("../config/db");

const { Schema } = mongoose;

const jobSchema = new Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "companies",
    },
    title: {
        // fullstack
        type: String,
        required: true,
    },
    modality: {
        // full time, part time,, freelance, internship
        type: String,
        require: true,
    },
    seniority: {
        // expert, senior, semi senior, junior, no experience required
        type: String,
    },
    remoteOption: {
        // No remote option (Select a City)
        // Temporarily remote during COVID-19 {Once the quarantine is lifted, what will be the job location?}(Select a City)
        // Locally remote only {Please specify the region where candidates must reside to apply} (input-text)
        // Fully remote
        type: Boolean,
    },
    jobLocation: {
        type: String,
    },
    salary: Number, // add validations
    category: {
        // programming, Ux ui, data science, devops,
        type: String,
    },
    description: {
        type: String,
    },
    perks: {
        // computer provide,
        type: {
            String,
        },
    },
    languageRequiredToApply: {
        // English, Spanish
        type: String,
    },
    responseTime: {
        type: String,
    },
    checked: {
        type: String,
    },

    applicants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "applicants",
        },
    ],
});

/* The first argument is the singular name of the collection your model is for. Mongoose automatically looks for the plural, lowercased version of your model name. Thus, for the example above, the model Tank is for the tanks collection in the database. */
/* for example, Child => children. Error founded Tooth, tooths */
const JobModel = mongoose.model("jobs", jobSchema);

module.exports = JobModel;
