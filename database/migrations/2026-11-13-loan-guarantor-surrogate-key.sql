-- Replaces the original composite primary key with the surrogate key expected
-- by the Sequelize model while retaining the unique loan/guarantor pair.
ALTER TABLE loan_guarantors
    DROP PRIMARY KEY,
    ADD COLUMN loan_guarantor_id INT NOT NULL AUTO_INCREMENT FIRST,
    ADD PRIMARY KEY (loan_guarantor_id),
    ADD UNIQUE KEY uq_loan_guarantors_pair (loan_id, guarantor_stakeholder_id);
