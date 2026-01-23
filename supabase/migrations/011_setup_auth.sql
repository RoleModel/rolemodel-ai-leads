-- Enable auth schema and create an admin user
-- This migration sets up Supabase Auth for admin access

-- Note: Supabase Auth is enabled by default and uses the auth schema
-- This file documents the setup process

-- To create an admin user, you can either:
-- 1. Use the Supabase Dashboard (Authentication > Users > Add User)
-- 2. Use the SQL below (replace with your desired email and password)

-- Example: Create an admin user via SQL
-- Note: In production, use the Supabase Dashboard or Auth API instead
-- This is just for documentation purposes

/*
-- Create a user function (if not using Dashboard)
-- You'll need to hash the password first
DO $$
DECLARE
  admin_email TEXT := 'admin@example.com';
  admin_password TEXT := 'your-secure-password-here';
BEGIN
  -- This will only work if you have the appropriate Supabase functions
  -- In most cases, use the Dashboard to create your first admin user
  NULL;
END $$;
*/

-- Grant admin users access to all tables
-- The middleware will check auth.users() to verify login
-- No additional RLS policies needed for admin access via service_role

-- Note: The auth schema is managed by Supabase and cannot be modified directly
