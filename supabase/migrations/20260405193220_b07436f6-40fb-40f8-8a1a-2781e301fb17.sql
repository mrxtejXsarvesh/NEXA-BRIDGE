CREATE POLICY "Institution users can create own institution"
ON public.institutions
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'institution'::app_role)
  AND managed_by = auth.uid()
);