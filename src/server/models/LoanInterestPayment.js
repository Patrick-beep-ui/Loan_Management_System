import { DataTypes } from "sequelize";
import connection from "../config/connection.js";

const LoanInterestPayment = connection.define("LoanInterestPayment", { // table name = loan_interest_payments
    loan_interest_payment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    payment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true
    },
    loan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    status: {
        type: DataTypes.ENUM("pending", "paid"),
        allowNull: false,
        defaultValue: "pending"
    }
}, {
    tableName: "loan_interest_payments",
    timestamps: false
})

export default LoanInterestPayment;
