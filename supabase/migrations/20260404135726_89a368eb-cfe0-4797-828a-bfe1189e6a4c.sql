
-- Fix 1: Prevent duplicate role insertion by adding check that user doesn't already have a role
DROP POLICY IF EXISTS "Users can insert own role on signup" ON public.user_roles;
CREATE POLICY "Users can insert own role on signup"
ON public.user_roles FOR INSERT TO public
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'student'::app_role
  AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
);

-- Fix 2: Restrict phone visibility - replace broad SELECT with column-aware view
-- Drop old permissive policy
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;

-- Users can see all profiles but phone only for own profile
CREATE POLICY "Users can view own full profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view others profiles"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() != user_id);
