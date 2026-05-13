CREATE POLICY "Admins can update any connection"
ON public.connections
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));