import { DataTypes } from "sequelize";
import connection from "../config/connection.js";

const InstallmentPayment = connection.define("InstallmentPayment", { // table name = installment_payments
    installment_payment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    payment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    installment_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: "installment_payments",
    timestamps: false
})

export default InstallmentPayment;
