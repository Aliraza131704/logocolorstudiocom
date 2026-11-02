CREATE OR REPLACE FUNCTION public.palette_like_totals()
RETURNS TABLE(palette_slug text, likes integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT palette_slug, count(*)::integer FROM public.palette_likes GROUP BY palette_slug
$$;
GRANT EXECUTE ON FUNCTION public.palette_like_totals() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.public_giveaway_winners()
RETURNS TABLE(id uuid, month text, name text, wallet text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, month, name, wallet FROM public.giveaway_winners ORDER BY month DESC
$$;
GRANT EXECUTE ON FUNCTION public.public_giveaway_winners() TO anon, authenticated;

DROP POLICY IF EXISTS "read likes" ON public.palette_likes;
CREATE POLICY "admin read likes" ON public.palette_likes FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "public read winners" ON public.giveaway_winners;
CREATE POLICY "admin read winners" ON public.giveaway_winners FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));