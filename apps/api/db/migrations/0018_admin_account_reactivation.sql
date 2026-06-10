ALTER TABLE admin_account_actions
DROP CONSTRAINT IF EXISTS admin_account_actions_target_role_check;

ALTER TABLE admin_account_actions
DROP CONSTRAINT IF EXISTS admin_account_actions_action_check;

ALTER TABLE admin_account_actions
ADD CONSTRAINT admin_account_actions_target_role_check
CHECK (target_role IN ('parent', 'nanny', 'admin'));

ALTER TABLE admin_account_actions
ADD CONSTRAINT admin_account_actions_action_check
CHECK (action IN ('suspend', 'reactivate'));
