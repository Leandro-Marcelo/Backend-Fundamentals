const { mongoose } = require("../config/db");

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: [true, "please enter a username"],
            unique: true,
        },
        email: {
            type: String,
            required: [true, "please enter a email"],
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        roles: [
            {
                type: Number,
            },
        ],
        CV: {
            type: String,
        },

        refreshTokens: [String],
    },
    { timestamps: true }
);

/* The first argument is the singular name of the collection your model is for. Mongoose automatically looks for the plural, lowercased version of your model name. Thus, for the example above, the model Tank is for the tanks collection in the database. */
/* for example, Child => children. Error founded Tooth, tooths */
const UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;
