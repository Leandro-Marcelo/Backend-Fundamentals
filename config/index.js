require("dotenv").config();

const config = {
    /* ********************************* Ports *******************************/
    port: process.env.PORT,
    port_socket_io: process.env.PORT_SOCKET_IO,

    /* ********************************* JWT / Tokens *******************************/
    jwt_secret: process.env.JWT_SECRET,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,

    /* *********************************** MongoDB *******************************/
    db_username: process.env.DB_USERNAME,
    db_password: process.env.DB_PASSWORD,
    db_host: process.env.DD_HOST,
    db_name: process.env.DB_NAME,
};

module.exports = config;
