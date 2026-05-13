
CREATE TABLE public.admin_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id uuid NOT NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  details text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view logs"
ON public.admin_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert logs"
ON public.admin_logs FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) AND auth.uid() = admin_user_id);

CREATE INDEX idx_admin_logs_created_at ON public.admin_logs (created_at DESC);
