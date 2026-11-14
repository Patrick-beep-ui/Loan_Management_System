import { DataTypes } from "sequelize";
import connection from "../config/connection.js";

const LoanPayment = connection.define("LoanPayment", { // table name = loan_payments
    payment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    paid_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    recorded_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: "loan_payments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})

export default LoanPayment;
