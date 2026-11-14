import { DataTypes } from "sequelize";
import connection from "../config/connection.js";

const Loan = connection.define("Loan", { // table name = loans
    loan_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    lender_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    loan_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    interest_rate: {
        type: DataTypes.DECIMAL(7, 4),
        allowNull: true
    },
    disbursed_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: "loans",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})

export default Loan;
