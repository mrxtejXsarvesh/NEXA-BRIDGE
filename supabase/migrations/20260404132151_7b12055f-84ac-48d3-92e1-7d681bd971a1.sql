CREATE POLICY "Receivers can mark messages as read"
ON public.messages
FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);