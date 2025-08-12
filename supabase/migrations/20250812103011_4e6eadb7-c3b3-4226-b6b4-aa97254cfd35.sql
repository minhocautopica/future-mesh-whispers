
-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.submit_survey(jsonb, jsonb, text);
DROP FUNCTION IF EXISTS public.submit_survey(text, text, text, boolean, text);

-- Create the correct function with the parameters that the app is expecting
CREATE OR REPLACE FUNCTION public.submit_survey(
  station_id_arg text,
  gender_arg text DEFAULT NULL,
  age_arg text DEFAULT NULL,
  resident_arg boolean DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  submission_id UUID;
BEGIN
  -- Insert into submissions table
  INSERT INTO submissions (
    station_id, 
    gender, 
    age, 
    resident, 
    consent_given,
    consent_version,
    consent_purpose,
    timestamp,
    created_at,
    updated_at
  ) 
  VALUES (
    station_id_arg,
    gender_arg::gender,
    age_arg::age_range,
    resident_arg,
    true,
    'v1',
    'academic research',
    NOW(),
    NOW(),
    NOW()
  )
  RETURNING id INTO submission_id;

  RETURN submission_id;
END;
$function$;
