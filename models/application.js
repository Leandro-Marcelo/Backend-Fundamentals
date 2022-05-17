const { mongoose } = require("../config/db");

const { Schema } = mongoose;

const applicantSchema = new Schema({
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    cv: {
        type: String,
    },
    interested: {
        // Why are you interested in working at Metbus?
        type: String,
    },
});

/* The first argument is the singular name of the collection your model is for. Mongoose automatically looks for the plural, lowercased version of your model name. Thus, for the example above, the model Tank is for the tanks collection in the database. */
/* for example, Child => children. Error founded Tooth, tooths */
const ApplicantModel = mongoose.model("applicants", applicantSchema);

module.exports = ApplicantModel;
