-- Create student badge enum
CREATE TYPE public.student_badge AS ENUM ('gold', 'silver', 'bronze');

-- Add badge column to profiles
ALTER TABLE public.profiles ADD COLUMN student_badge student_badge DEFAULT NULL;