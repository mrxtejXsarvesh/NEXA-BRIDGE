
DROP POLICY IF EXISTS "Institutions viewable by authenticated" ON public.institutions;
CREATE POLICY "Institutions viewable by everyone" ON public.institutions FOR SELECT USING (true);
