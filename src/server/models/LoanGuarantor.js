import { DataTypes } from "sequelize";
import connection from "../config/connection.js";

const LoanGuarantor = connection.define("LoanGuarantor", { // table name = loan_guarantors
    loan_guarantor_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    loan_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    guarantor_stakeholder_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: "loan_guarantors",
    timestamps: false,
    indexes: [
        { unique: true, fields: ["loan_id", "guarantor_stakeholder_id"] }
    ]
})

export default LoanGuarantor;
