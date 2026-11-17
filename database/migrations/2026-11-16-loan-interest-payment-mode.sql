-- Stores whether ordinary interest is included in the installment schedule
-- or tracked as a separate pending obligation.
ALTER TABLE loans
    ADD COLUMN interest_payment_mode ENUM('included', 'separate') NOT NULL
    AFTER interest_rate;

-- A separate-mode interest obligation exists before any payment is received.
-- Exactly one interest-payment record is allowed per loan.
ALTER TABLE loan_interest_payments
    MODIFY COLUMN payment_id INT NULL,
    ADD COLUMN status ENUM('pending', 'paid') NOT NULL DEFAULT 'pending'
        AFTER loan_id,
    ADD UNIQUE KEY uq_loan_interest_payments_loan (loan_id),
    ADD CONSTRAINT chk_loan_interest_payment_state CHECK (
        (status = 'pending' AND payment_id IS NULL)
        OR (status = 'paid' AND payment_id IS NOT NULL)
    );
