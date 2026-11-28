CREATE DATABASE IF NOT EXISTS loan_management_system
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE loan_management_system;

CREATE TABLE IF NOT EXISTS roles (
    role_id INT NOT NULL AUTO_INCREMENT,
    role_name VARCHAR(30) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (role_id),
    UNIQUE KEY uq_roles_name (role_name)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS stakeholders (
    stakeholder_id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    national_id VARCHAR(30) NULL,
    marital_status ENUM('single', 'married') NULL,
    occupation VARCHAR(100) NULL,
    date_of_birth DATE NULL,

    PRIMARY KEY (stakeholder_id),
    UNIQUE KEY uq_stakeholders_national_id (national_id)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS users (
    user_id INT NOT NULL AUTO_INCREMENT,
    stakeholder_id INT NOT NULL,
    email VARCHAR(254) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,

    PRIMARY KEY (user_id),
    UNIQUE KEY uq_users_stakeholder (stakeholder_id),
    UNIQUE KEY uq_users_email (email),
    CONSTRAINT fk_users_stakeholder FOREIGN KEY (stakeholder_id)
        REFERENCES stakeholders (stakeholder_id),
    CONSTRAINT fk_users_role FOREIGN KEY (role_id)
        REFERENCES roles (role_id)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS loans (
    loan_id INT NOT NULL AUTO_INCREMENT,
    lender_id INT NOT NULL,
    customer_id INT NOT NULL,
    loan_amount DECIMAL(12,2) NOT NULL,
    interest_rate DECIMAL(7,4) NULL,
    interest_amount DECIMAL(12,2) NULL,
    disbursed_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (loan_id),
    CONSTRAINT fk_loans_lender FOREIGN KEY (lender_id)
        REFERENCES stakeholders (stakeholder_id),
    CONSTRAINT fk_loans_customer FOREIGN KEY (customer_id)
        REFERENCES stakeholders (stakeholder_id),
    CONSTRAINT chk_loans_amount CHECK (loan_amount > 0),
    CONSTRAINT chk_loans_interest_rate CHECK (interest_rate >= 0),
    CONSTRAINT chk_loans_interest_amount CHECK (interest_amount >= 0),
    CONSTRAINT chk_loans_one_interest_method CHECK (
        (interest_rate IS NOT NULL AND interest_amount IS NULL)
        OR (interest_rate IS NULL AND interest_amount IS NOT NULL)
    )
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS loan_installments (
    installment_id INT NOT NULL AUTO_INCREMENT,
    loan_id INT NOT NULL,
    amount_due DECIMAL(12,2) NOT NULL,
    installment_number INT NOT NULL,
    due_date DATE NOT NULL,
    interest_rate DECIMAL(7,4) NULL,
    status ENUM('paid', 'pending', 'overdue', 'deferred')
        NOT NULL DEFAULT 'pending',

    PRIMARY KEY (installment_id),
    UNIQUE KEY uq_loan_installments_number (loan_id, installment_number),
    CONSTRAINT fk_loan_installments_loan FOREIGN KEY (loan_id)
        REFERENCES loans (loan_id),
    CONSTRAINT chk_loan_installments_amount CHECK (amount_due > 0),
    CONSTRAINT chk_loan_installments_number CHECK (installment_number > 0),
    CONSTRAINT chk_loan_installments_interest_rate CHECK (interest_rate >= 0)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS loan_guarantors (
    loan_id INT NOT NULL,
    guarantor_stakeholder_id INT NOT NULL,

    PRIMARY KEY (loan_id, guarantor_stakeholder_id),
    CONSTRAINT fk_loan_guarantors_loan FOREIGN KEY (loan_id)
        REFERENCES loans (loan_id),
    CONSTRAINT fk_loan_guarantors_stakeholder
        FOREIGN KEY (guarantor_stakeholder_id)
        REFERENCES stakeholders (stakeholder_id)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS loan_collaterals (
    loan_collateral_id INT NOT NULL AUTO_INCREMENT,
    loan_id INT NOT NULL,
    description TEXT NOT NULL,
    estimated_value DECIMAL(12,2) NULL,

    PRIMARY KEY (loan_collateral_id),
    CONSTRAINT fk_loan_collaterals_loan FOREIGN KEY (loan_id)
        REFERENCES loans (loan_id),
    CONSTRAINT chk_loan_collaterals_value CHECK (estimated_value >= 0)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS loan_payments (
    payment_id INT NOT NULL AUTO_INCREMENT,
    amount DECIMAL(12,2) NOT NULL,
    paid_at DATETIME NOT NULL,
    recorded_by INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (payment_id),
    CONSTRAINT fk_loan_payments_user FOREIGN KEY (recorded_by)
        REFERENCES users (user_id),
    CONSTRAINT chk_loan_payments_amount CHECK (amount > 0)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS installment_payments (
    payment_id INT NOT NULL,
    installment_id INT NOT NULL,

    PRIMARY KEY (payment_id),
    CONSTRAINT fk_installment_payments_payment FOREIGN KEY (payment_id)
        REFERENCES loan_payments (payment_id),
    CONSTRAINT fk_installment_payments_installment FOREIGN KEY (installment_id)
        REFERENCES loan_installments (installment_id)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS loan_interest_payments (
    payment_id INT NOT NULL,
    loan_id INT NOT NULL,

    PRIMARY KEY (payment_id),
    CONSTRAINT fk_loan_interest_payments_payment FOREIGN KEY (payment_id)
        REFERENCES loan_payments (payment_id),
    CONSTRAINT fk_loan_interest_payments_loan FOREIGN KEY (loan_id)
        REFERENCES loans (loan_id)
) ENGINE = InnoDB;

INSERT INTO roles (role_name)
VALUES ('admin'), ('operator')
ON DUPLICATE KEY UPDATE role_name = roles.role_name;
