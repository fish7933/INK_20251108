-- Delete super admin user 'aaa'
DELETE FROM app_7c39e793e3_admin_users 
WHERE username = 'aaa' AND role = 'super_admin';
