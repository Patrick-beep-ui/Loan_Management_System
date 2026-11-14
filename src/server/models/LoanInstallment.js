import { DataTypes } from "sequelize";
import connection from "../config/connection.js";

const LoanInstallment = connection.define("LoanInstallment", { // table name = loan_installments
    installment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    loan_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    amount_due: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    installment_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    due_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    interest_rate: {
        type: DataTypes.DECIMAL(7, 4),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM("paid", "pending", "overdue", "deferred"),
        allowNull: false,
        defaultValue: "pending"
    }
}, {
    tableName: "loan_installments",
    timestamps: false,
    indexes: [
        { unique: true, fields: ["loan_id", "installment_number"] }
    ]
})

export default LoanInstallment;
