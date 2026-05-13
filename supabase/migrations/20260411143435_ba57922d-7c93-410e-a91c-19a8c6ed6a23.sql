
-- Announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Owner can create announcements" ON public.announcements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can update announcements" ON public.announcements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owner can delete announcements" ON public.announcements FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can update any announcement" ON public.announcements FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete any announcement" ON public.announcements FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Articles table
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  tag TEXT DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published articles" ON public.articles FOR SELECT USING (published = true OR auth.uid() = user_id);
CREATE POLICY "Users can create articles" ON public.articles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own articles" ON public.articles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own articles" ON public.articles FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can update any article" ON public.articles FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete any article" ON public.articles FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
