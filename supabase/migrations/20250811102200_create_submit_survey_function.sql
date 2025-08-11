-- Create a secure function to handle survey submissions
-- This function runs with the privileges of the user who defines it (the admin),
-- allowing it to bypass RLS policies for a single, controlled transaction.

CREATE OR REPLACE FUNCTION public.submit_survey(
  station_id_arg text,
  gender_arg public.gender,
  age_arg public.age_range,
  resident_arg boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
-- Set a search path to prevent hijacking, a security best practice
SET search_path = public
AS $$
DECLARE
  new_submission_id uuid;
BEGIN
  -- Insert the submission data passed as arguments
  INSERT INTO public.submissions (station_id, gender, age, resident)
  VALUES (station_id_arg, gender_arg, age_arg, resident_arg)
  RETURNING id INTO new_submission_id;

  -- Return the ID of the new submission
  RETURN new_submission_id;
END;
$$;
