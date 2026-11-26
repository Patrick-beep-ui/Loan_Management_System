-- Adds an activation flag to user accounts. checkAuth reads it on every
-- request, so deactivating an account invalidates its existing token
-- without waiting for the token to expire.
ALTER TABLE users
    ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE
    AFTER role_id;
