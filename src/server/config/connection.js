import { Sequelize } from "sequelize";

const connection = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "mysql"
    
    }
)

const testConnection = async () => {
    try {
        await connection.authenticate();
        console.log("DB Connection has been established successfully.");
    }
    catch(err) {
        console.error("Unable to connect to the database:", err);
    }
}

testConnection();

export default connection;