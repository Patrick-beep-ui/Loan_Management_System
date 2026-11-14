import { DataTypes } from "sequelize";
import connection from "../config/connection.js";

const LoanCollateral = connection.define("LoanCollateral", { // table name = loan_collaterals
    loan_collateral_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    loan_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    estimated_value: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
    }
}, {
    tableName: "loan_collaterals",
    timestamps: false
})

export default LoanCollateral;
