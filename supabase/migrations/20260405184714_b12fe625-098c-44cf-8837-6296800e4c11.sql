
CREATE TABLE public.institutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  logo_url TEXT DEFAULT '',
  location TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  website TEXT DEFAULT '',
  established_year INTEGER,
  type TEXT DEFAULT 'government',
  affiliation TEXT DEFAULT '',
  description TEXT DEFAULT '',
  departments TEXT[] DEFAULT '{}',
  total_students INTEGER DEFAULT 0,
  placement_rate NUMERIC(5,2) DEFAULT 0,
  highest_package TEXT DEFAULT '',
  average_package TEXT DEFAULT '',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institutions viewable by authenticated" ON public.institutions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert institutions" ON public.institutions FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update institutions" ON public.institutions FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete institutions" ON public.institutions FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON public.institutions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
