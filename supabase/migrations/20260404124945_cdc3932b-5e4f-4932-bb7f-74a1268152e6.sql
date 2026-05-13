
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings"
ON public.site_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can insert settings"
ON public.site_settings FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update settings"
ON public.site_settings FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete settings"
ON public.site_settings FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default content
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
('hero', '{"badge":"The Alumni Connection Engine","title":"Bridge the gap between","highlight":"alumni & students","description":"A centralized platform for managing alumni engagement, mentorship, internships, and institutional growth — all in one place.","cta_text":"Join the Network","cta_secondary":"Learn More"}'::jsonb),
('stats', '[{"value":"10K+","label":"Alumni Connected"},{"value":"500+","label":"Job Opportunities"},{"value":"200+","label":"Events Hosted"},{"value":"98%","label":"Satisfaction Rate"}]'::jsonb),
('features', '[{"title":"Alumni Directory","desc":"Search and filter alumni by department, skills, company, and graduation year.","icon":"Users"},{"title":"Real-time Chat","desc":"Connect and message alumni directly with secure, real-time messaging.","icon":"MessageSquare"},{"title":"Jobs & Internships","desc":"Browse career opportunities posted by alumni from top companies.","icon":"Briefcase"},{"title":"Events & Webinars","desc":"Stay updated with alumni reunions, webinars, and networking events.","icon":"Calendar"},{"title":"Mentorship","desc":"Request mentorship appointments from experienced alumni in your field.","icon":"GraduationCap"},{"title":"Secure Platform","desc":"Role-based access with enterprise-grade security and privacy controls.","icon":"Shield"}]'::jsonb),
('steps', '[{"step":"01","title":"Create Account","desc":"Sign up as a student or alumni with your institutional email."},{"step":"02","title":"Build Your Profile","desc":"Add your skills, experience, and career interests."},{"step":"03","title":"Start Connecting","desc":"Browse the directory, join events, and grow your network."}]'::jsonb),
('testimonials', '[{"name":"Priya Sharma","role":"Software Engineer, Google","text":"NexaBridge helped me find my dream internship through an alumni connection. The mentorship feature is incredible!","avatar":"PS"},{"name":"Rahul Verma","role":"Product Manager, Microsoft","text":"As an alumni, I love giving back. This platform makes it so easy to connect with students and share opportunities.","avatar":"RV"},{"name":"Anita Desai","role":"Data Scientist, Amazon","text":"The events and webinars organized through NexaBridge have been a game-changer for my professional development.","avatar":"AD"}]'::jsonb),
('developer', '{"title":"Meet the Developer","description":"NexaBridge was designed and built with passion by a dedicated developer focused on creating meaningful connections between alumni and students. Built with modern technologies for performance, security, and scalability.","techs":["React","TypeScript","Tailwind CSS","Supabase","Framer Motion"],"github_url":"https://github.com","show_section":true}'::jsonb),
('cta', '{"title":"Ready to connect your alumni network?","description":"Join NexaBridge today and strengthen your institution''s community.","button_text":"Get Started Free"}'::jsonb),
('footer', '{"brand":"NexaBridge","tagline":"The Alumni Connection Engine"}'::jsonb);
