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
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    must_change_password: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: "users",
    timestamps: false,
})

export default User;