const { mongoose } = require("../config/db");

const { Schema } = mongoose;

const companySchema = new Schema({
    CompanyName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    Country: {
        type: String,
    },
    CompanyLogo: {
        type: String,
    },
    administratorEmailAddress: {
        type: String,
    },
    linkedinCompanyLink: {
        type: String,
    },
    companyWebsite: {
        type: String,
    },
    shortDescription: {
        type: String,
    },
    longDescription: {
        type: String,
    },
    socialProfiles: {
        twitter: { type: String },
        facebook: { type: String },
        github: { type: String },
    },
});

/* The first argument is the singular name of the collection your model is for. Mongoose automatically looks for the plural, lowercased version of your model name. Thus, for the example above, the model Tank is for the tanks collection in the database. */
/* for example, Child => children. Error founded Tooth, tooths */
const CompanyModel = mongoose.model("companies", companySchema);

module.exports = CompanyModel;
