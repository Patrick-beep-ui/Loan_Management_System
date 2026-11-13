import { DataTypes } from "sequelize";
import connection from "../config/connection.js";

const User = connection.define("User", { // table name = users
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    stakeholder_id: {
        type: DataTypes.INTEGER,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    }, 
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role_id: {
        type: DataTypes.INTEGER,
    }
}, {
    tableName: "users",
    timestamps: false,
})

export default User;