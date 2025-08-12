-- Allow anonymous uploads to survey bucket
DROP POLICY IF EXISTS "Anon can upload survey files" ON storage.objects;

CREATE POLICY "Anonymous can upload survey files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'survey');

-- Allow anonymous access to survey files for the app to function
DROP POLICY IF EXISTS "Authenticated can read survey files" ON storage.objects;

CREATE POLICY "Anonymous can read survey files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'survey');