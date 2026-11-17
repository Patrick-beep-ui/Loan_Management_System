import { DataTypes } from "sequelize";
import connection from "../config/connection.js";

function toCents(value) {
    const amount = Number(value);

    return Number.isFinite(amount) ? Math.round(amount * 100) : null;
}

function interestCents(loanAmount, interestRate) {
    const loanCents = toCents(loanAmount);
    const rate = Number(interestRate ?? 0);

    if (loanCents === null || !Number.isFinite(rate)) {
        return null;
    }

    return Math.round((loanCents * rate) / 100);
}

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
    interest_payment_mode: {
        type: DataTypes.ENUM("included", "separate"),
        allowNull: false
    },
    disbursed_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    interest_amount: {
        type: DataTypes.VIRTUAL,
        get() {
            const cents = interestCents(
                this.getDataValue("loan_amount"),
                this.getDataValue("interest_rate")
            );

            return cents === null ? null : cents / 100;
        }
    },
    total_to_pay: {
        type: DataTypes.VIRTUAL,
        get() {
            const loanCents = toCents(this.getDataValue("loan_amount"));
            const cents = interestCents(
                this.getDataValue("loan_amount"),
                this.getDataValue("interest_rate")
            );

            if (loanCents === null || cents === null) {
                return null;
            }

            return (loanCents + cents) / 100;
        }
    }
}, {
    tableName: "loans",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})

export default Loan;
