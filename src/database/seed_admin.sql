-- ========================================================================================
-- MEDIFLOW — Fix Broken RLS + Create Admin Account
-- Run ALL of this in Supabase Dashboard → SQL Editor → New Query → RUN
-- ========================================================================================


-- ── PART 1: Fix the infinite-recursion RLS policy on user_roles ──────────────────────
-- The old policy queried user_roles FROM WITHIN user_roles, causing a loop.
-- We replace it with a SECURITY DEFINER function that bypasses RLS safely.

-- Step 1a: Drop the broken policy
DROP POLICY IF EXISTS "users_can_read_own_role" ON public.user_roles;

-- Step 1b: Create a helper function that checks role WITHOUT triggering RLS
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER   -- runs as the DB owner, bypasses RLS — safe for this read-only check
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Step 1c: Recreate the policy using the safe helper function (no more recursion)
CREATE POLICY "users_can_read_own_role" ON public.user_roles
  FOR SELECT USING (
    auth.uid()::uuid = user_id
    OR public.get_my_role() = 'admin'
  );


-- ── PART 2: Create the permanent admin account ────────────────────────────────────────
-- This assumes you ALREADY created admin@gmail.com via:
-- Supabase Dashboard → Authentication → Users → "Add user" (with Auto Confirm ✅)
--
-- If the user doesn't exist yet, do that first, then re-run this script.

DO $$
DECLARE
    v_user_id UUID;
    v_email   TEXT := 'admin@gmail.com';  -- ← change to match your auth user email
BEGIN
    -- Find the user in auth.users
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION
            E'User "%" not found.\nGo to Supabase → Authentication → Users → Add user, then re-run this script.', v_email;
    END IF;

    -- Upsert user_profiles
    INSERT INTO public.user_profiles (user_id, email, first_name, last_name)
    VALUES (v_user_id, v_email, 'System', 'Administrator')
    ON CONFLICT (user_id) DO UPDATE
        SET first_name = 'System', last_name = 'Administrator', updated_at = NOW();

    -- Force role = admin (overrides any previous patient/staff role)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin', updated_at = NOW();

    -- Create staff record (required for staff-level dashboard pages)
    INSERT INTO public.staff (user_id, employee_id, department, is_active)
    VALUES (v_user_id, 'ADMIN-001', 'Administration', TRUE)
    ON CONFLICT (user_id) DO NOTHING;

    RAISE NOTICE '✅ Admin setup complete for %', v_email;
END $$;


-- ── PART 3: Verify — you should see role = admin ──────────────────────────────────────
SELECT
    au.email,
    up.first_name || ' ' || up.last_name AS full_name,
    ur.role,
    au.email_confirmed_at IS NOT NULL    AS email_confirmed,
    s.employee_id
FROM auth.users au
LEFT JOIN public.user_profiles up ON up.user_id = au.id
LEFT JOIN public.user_roles    ur ON ur.user_id = au.id
LEFT JOIN public.staff          s ON  s.user_id = au.id
WHERE au.email = 'admin@gmail.com';
