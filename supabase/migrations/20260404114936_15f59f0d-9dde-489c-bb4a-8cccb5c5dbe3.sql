
-- Role enum
CREATE TYPE public.app_role AS ENUM ('student', 'alumni', 'admin');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own role on signup" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  bio TEXT DEFAULT '',
  graduation_year INTEGER,
  department TEXT DEFAULT '',
  company TEXT DEFAULT '',
  position TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  avatar_url TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  linkedin_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Connections
CREATE TYPE public.connection_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status connection_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own connections" ON public.connections FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send connections" ON public.connections FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receiver can update connection" ON public.connections FOR UPDATE USING (auth.uid() = receiver_id);

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Appointments
CREATE TYPE public.appointment_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  requested_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  scheduled_at TIMESTAMPTZ NOT NULL,
  status appointment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own appointments" ON public.appointments FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = requested_id);
CREATE POLICY "Users can create appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Requested user can update appointment" ON public.appointments FOR UPDATE USING (auth.uid() = requested_id);

-- Jobs
CREATE TYPE public.job_type AS ENUM ('full_time', 'part_time', 'internship', 'contract');

CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT NOT NULL,
  job_type job_type NOT NULL DEFAULT 'full_time',
  location TEXT DEFAULT '',
  apply_url TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Jobs viewable by authenticated" ON public.jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Alumni/admin can post jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = posted_by AND (public.has_role(auth.uid(), 'alumni') OR public.has_role(auth.uid(), 'admin')));
CREATE POLICY "Owner can update jobs" ON public.jobs FOR UPDATE USING (auth.uid() = posted_by);
CREATE POLICY "Owner can delete jobs" ON public.jobs FOR DELETE USING (auth.uid() = posted_by);

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT DEFAULT '',
  is_virtual BOOLEAN DEFAULT false,
  meeting_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events viewable by authenticated" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Alumni/admin can create events" ON public.events FOR INSERT WITH CHECK (auth.uid() = created_by AND (public.has_role(auth.uid(), 'alumni') OR public.has_role(auth.uid(), 'admin')));
CREATE POLICY "Owner can update events" ON public.events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Owner can delete events" ON public.events FOR DELETE USING (auth.uid() = created_by);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON public.connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
