CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  new_role public.app_role;
  institution_name text;
BEGIN
  new_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'student'::public.app_role);
  institution_name := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'institution_name', '')), '');

  INSERT INTO public.profiles (user_id, full_name, company)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE WHEN new_role = 'institution' THEN COALESCE(institution_name, '') ELSE '' END
  )
  ON CONFLICT (user_id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      company = EXCLUDED.company,
      updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, new_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  IF new_role = 'institution' AND institution_name IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.institutions
      WHERE managed_by = NEW.id
    ) THEN
      INSERT INTO public.institutions (
        name,
        managed_by,
        description,
        location,
        city,
        state,
        website,
        type,
        affiliation,
        departments,
        total_students,
        placement_rate,
        highest_package,
        average_package,
        is_featured,
        tagline,
        vision,
        achievements,
        banner_url,
        logo_url
      )
      VALUES (
        institution_name,
        NEW.id,
        '',
        '',
        '',
        '',
        '',
        'government',
        '',
        '{}',
        0,
        0,
        '',
        '',
        false,
        '',
        '',
        '{}',
        '',
        ''
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;