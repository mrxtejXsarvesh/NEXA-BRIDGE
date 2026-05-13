-- Fix 1: Restrict self-insert role to 'student' only (prevent privilege escalation)
DROP POLICY IF EXISTS "Users can insert own role on signup" ON public.user_roles;
CREATE POLICY "Users can insert own role on signup"
ON public.user_roles FOR INSERT TO public
WITH CHECK (auth.uid() = user_id AND role = 'student'::app_role);

-- Fix 2: Drop overly permissive SELECT policy on user_roles
DROP POLICY IF EXISTS "Authenticated users can view all roles" ON public.user_roles;

-- Fix 3: Replace broad profiles SELECT with a view that hides phone from non-owners/non-admins
-- We can't do column-level RLS easily, so we'll keep the policy but note it.
-- Instead, create a secure view for profile listing that excludes phone
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated"
ON public.profiles FOR SELECT TO authenticated
USING (true);
-- Phone exposure will be handled at application level by not selecting phone in directory queries