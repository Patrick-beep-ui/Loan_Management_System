-- Renames the operator role to lender. role_id is preserved so existing
-- user assignments keep working without reassigning foreign keys.
UPDATE roles
SET role_name = 'lender',
    updated_at = CURRENT_TIMESTAMP
WHERE role_name = 'operator';
