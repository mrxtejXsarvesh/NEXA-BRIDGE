
-- Add is_blocked column to profiles
ALTER TABLE public.profiles ADD COLUMN is_blocked boolean NOT NULL DEFAULT false;

-- Allow admins to update any profile (for blocking)
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete any profile
CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update roles
CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete roles
CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete any job
CREATE POLICY "Admins can delete any job"
ON public.jobs FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update any job
CREATE POLICY "Admins can update any job"
ON public.jobs FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete any event
CREATE POLICY "Admins can delete any event"
ON public.events FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update any event
CREATE POLICY "Admins can update any event"
ON public.events FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete messages
CREATE POLICY "Admins can delete messages"
ON public.messages FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
