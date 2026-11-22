CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _user_id IS NOT NULL
    AND _user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
    AND (_role <> 'admin' OR coalesce(auth.jwt()->>'aal', '') = 'aal2' OR NOT EXISTS (SELECT 1 FROM auth.mfa_factors WHERE user_id = _user_id AND status = 'verified'))
$$;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

CREATE POLICY "Public can view blog images" ON storage.objects FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] IN ('covers', 'og', 'posts')
  AND lower(storage.extension(name)) IN ('png', 'jpg', 'jpeg', 'webp', 'gif', 'avif', 'svg')
);