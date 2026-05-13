
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS managed_by UUID DEFAULT NULL;

CREATE POLICY "Institution users can update own institution"
ON public.institutions FOR UPDATE TO authenticated
USING (auth.uid() = managed_by);

DROP POLICY IF EXISTS "Users can insert own role on signup" ON public.user_roles;
CREATE POLICY "Users can insert own role on signup"
ON public.user_roles FOR INSERT TO public
WITH CHECK (
  (auth.uid() = user_id)
  AND (role IN ('student', 'institution'))
  AND (NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid()))
);
