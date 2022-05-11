const whitelist = ["https://www.yoursite.com"];

const corsOptions = {
    origin: (origin, callback) => {
        /* in mode development, add !origin */
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    optionsSuccessStatus: 200,
};

module.exports = corsOptions;
