
DROP POLICY "System can insert notifications" ON public.notifications;

CREATE POLICY "No direct user inserts"
ON public.notifications FOR INSERT
WITH CHECK (false);
