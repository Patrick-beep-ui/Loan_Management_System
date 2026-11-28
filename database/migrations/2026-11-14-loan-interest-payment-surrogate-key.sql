-- Replaces the original payment_id primary key before the next migration makes
-- payment_id nullable for pending separate-interest obligations.
ALTER TABLE loan_interest_payments
    DROP PRIMARY KEY,
    ADD COLUMN loan_interest_payment_id INT NOT NULL AUTO_INCREMENT FIRST,
    ADD PRIMARY KEY (loan_interest_payment_id),
    ADD UNIQUE KEY uq_loan_interest_payments_payment (payment_id);
