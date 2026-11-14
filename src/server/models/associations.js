import Stakeholder from "./Stakeholder.js";
import User from "./User.js";
import Role from "./Role.js";
import Loan from "./Loan.js";
import LoanInstallment from "./LoanInstallment.js";
import LoanGuarantor from "./LoanGuarantor.js";
import LoanCollateral from "./LoanCollateral.js";
import LoanPayment from "./LoanPayment.js";
import InstallmentPayment from "./InstallmentPayment.js";
import LoanInterestPayment from "./LoanInterestPayment.js";

// User - Stakeholder
User.belongsTo(Stakeholder, { foreignKey: "stakeholder_id" });
Stakeholder.hasMany(User, { foreignKey: "stakeholder_id" });

// User - Role
User.belongsTo(Role, { foreignKey: "role_id" });
Role.hasMany(User, { foreignKey: "role_id" });

// Loan - Stakeholder (lender)
Loan.belongsTo(Stakeholder, { foreignKey: "lender_id", as: "lender" });
Stakeholder.hasMany(Loan, { foreignKey: "lender_id", as: "loansAsLender" });

// Loan - Stakeholder (customer)
Loan.belongsTo(Stakeholder, { foreignKey: "customer_id", as: "customer" });
Stakeholder.hasMany(Loan, { foreignKey: "customer_id", as: "loansAsCustomer" });

// Loan - LoanInstallment
Loan.hasMany(LoanInstallment, { foreignKey: "loan_id", as: "installments" });
LoanInstallment.belongsTo(Loan, { foreignKey: "loan_id" });

// Loan - LoanGuarantor
Loan.hasMany(LoanGuarantor, { foreignKey: "loan_id" });
LoanGuarantor.belongsTo(Loan, { foreignKey: "loan_id" });

// LoanGuarantor - Stakeholder
LoanGuarantor.belongsTo(Stakeholder, { foreignKey: "guarantor_stakeholder_id", as: "guarantor" });
Stakeholder.hasMany(LoanGuarantor, { foreignKey: "guarantor_stakeholder_id", as: "guarantorLinks" });

// Loan - LoanCollateral
Loan.hasMany(LoanCollateral, { foreignKey: "loan_id" });
LoanCollateral.belongsTo(Loan, { foreignKey: "loan_id" });

// LoanPayment - User
LoanPayment.belongsTo(User, { foreignKey: "recorded_by", as: "recordedBy" });
User.hasMany(LoanPayment, { foreignKey: "recorded_by", as: "payments" });

// LoanPayment - InstallmentPayment (one payment is applied to at most one installment)
LoanPayment.hasOne(InstallmentPayment, { foreignKey: "payment_id" });
InstallmentPayment.belongsTo(LoanPayment, { foreignKey: "payment_id" });

// LoanInstallment - InstallmentPayment
LoanInstallment.hasMany(InstallmentPayment, { foreignKey: "installment_id" });
InstallmentPayment.belongsTo(LoanInstallment, { foreignKey: "installment_id" });

// LoanPayment - LoanInterestPayment (one payment is applied to at most one loan interest)
LoanPayment.hasOne(LoanInterestPayment, { foreignKey: "payment_id" });
LoanInterestPayment.belongsTo(LoanPayment, { foreignKey: "payment_id" });

// Loan - LoanInterestPayment
Loan.hasMany(LoanInterestPayment, { foreignKey: "loan_id", as: "interestPayments" });
LoanInterestPayment.belongsTo(Loan, { foreignKey: "loan_id" });
