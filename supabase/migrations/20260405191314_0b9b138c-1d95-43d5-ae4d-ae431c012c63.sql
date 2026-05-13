
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS banner_url text DEFAULT '';
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS tagline text DEFAULT '';
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS vision text DEFAULT '';
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS achievements text[] DEFAULT '{}';
