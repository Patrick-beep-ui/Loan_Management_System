-- Adds a forced password-change flag for accounts created by an administrator.
-- Existing accounts keep FALSE; admin-created accounts are inserted with TRUE.
ALTER TABLE users
    ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT FALSE
    AFTER is_active;
