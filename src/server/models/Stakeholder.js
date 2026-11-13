import { DataTypes } from "sequelize";
import connection from "../config/connection.js";

const Stakeholder = connection.define("Stakeholder", { // table name = stakeholders
    stakeholder_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    national_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    marital_status: {
        type: DataTypes.ENUM('single', 'married'),
        allowNull: true
    },
    occupation: {
        type: DataTypes.STRING,
        allowNull: true   
    },
    date_of_birth: {
        type: DataTypes.DATE,
        allowNull: true 
    }
}, {
    tableName: "stakeholders",
    timestamps: false,
})

export default Stakeholder;