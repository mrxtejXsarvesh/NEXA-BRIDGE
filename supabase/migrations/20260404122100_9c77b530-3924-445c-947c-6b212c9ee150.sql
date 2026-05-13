
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  is_read BOOLEAN NOT NULL DEFAULT false,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- System insert policy (for triggers using SECURITY DEFINER functions)
CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger function for connection requests
CREATE OR REPLACE FUNCTION public.notify_connection_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_name TEXT;
BEGIN
  SELECT full_name INTO sender_name FROM public.profiles WHERE user_id = NEW.sender_id LIMIT 1;
  INSERT INTO public.notifications (user_id, type, title, message, reference_id)
  VALUES (
    NEW.receiver_id,
    'connection_request',
    'New Connection Request',
    COALESCE(sender_name, 'Someone') || ' sent you a connection request.',
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_connection_request
AFTER INSERT ON public.connections
FOR EACH ROW
EXECUTE FUNCTION public.notify_connection_request();

-- Trigger function for new messages
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_name TEXT;
BEGIN
  SELECT full_name INTO sender_name FROM public.profiles WHERE user_id = NEW.sender_id LIMIT 1;
  INSERT INTO public.notifications (user_id, type, title, message, reference_id)
  VALUES (
    NEW.receiver_id,
    'new_message',
    'New Message',
    COALESCE(sender_name, 'Someone') || ': ' || LEFT(NEW.content, 50),
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_message();
