DROP POLICY IF EXISTS "Public can view media" ON storage.objects;
CREATE POLICY "Admins can view media" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));