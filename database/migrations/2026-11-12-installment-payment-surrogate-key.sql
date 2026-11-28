-- Replaces the original payment_id primary key with the surrogate key expected
-- by the Sequelize model while preserving one payment per installment payment.
ALTER TABLE installment_payments
    DROP PRIMARY KEY,
    ADD COLUMN installment_payment_id INT NOT NULL AUTO_INCREMENT FIRST,
    ADD PRIMARY KEY (installment_payment_id),
    ADD UNIQUE KEY uq_installment_payments_payment (payment_id);
