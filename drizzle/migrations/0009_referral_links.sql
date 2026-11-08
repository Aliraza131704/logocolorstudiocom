CREATE TABLE public.referral_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE CHECK (code ~ '^[a-z0-9][a-z0-9-]{0,39}$'),
  label text NOT NULL CHECK (char_length(label) BETWEEN 1 AND 80),
  target_path text NOT NULL DEFAULT '/' CHECK (target_path ~ '^/[^/\\]' OR target_path = '/'),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.referral_links TO authenticated;
GRANT ALL ON public.referral_links TO service_role;
ALTER TABLE public.referral_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage referral links" ON public.referral_links FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.referral_clicks (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  link_id uuid NOT NULL REFERENCES public.referral_links(id) ON DELETE CASCADE,
  visitor_hash text NOT NULL DEFAULT '',
  referrer_host text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX referral_clicks_link_time_idx ON public.referral_clicks (link_id, created_at DESC);
GRANT SELECT, DELETE ON public.referral_clicks TO authenticated;
GRANT ALL ON public.referral_clicks TO service_role;
ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read referral clicks" ON public.referral_clicks FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete referral clicks" ON public.referral_clicks FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Public click recorder: only way anonymous visitors touch these tables.
-- Returns the target path for an active link (NULL when unknown/paused).
-- Repeat clicks by the same visitor on the same link within 60 seconds are not counted again.
CREATE OR REPLACE FUNCTION public.record_referral_click(_code text, _visitor text, _referrer text, _count boolean DEFAULT true)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  l public.referral_links%ROWTYPE;
  v text := left(coalesce(_visitor, ''), 64);
BEGIN
  SELECT * INTO l FROM public.referral_links WHERE code = lower(left(coalesce(_code, ''), 40)) AND active;
  IF NOT FOUND THEN RETURN NULL; END IF;
  IF _count AND NOT EXISTS (
    SELECT 1 FROM public.referral_clicks
    WHERE link_id = l.id AND v <> '' AND visitor_hash = v AND created_at > now() - interval '60 seconds'
  ) THEN
    INSERT INTO public.referral_clicks (link_id, visitor_hash, referrer_host)
    VALUES (l.id, v, left(coalesce(_referrer, ''), 120));
  END IF;
  RETURN l.target_path;
END;
$$;
REVOKE ALL ON FUNCTION public.record_referral_click(text, text, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_referral_click(text, text, text, boolean) TO anon, authenticated, service_role;

-- Admin-only aggregated stats (runs as the caller, so RLS limits it to admins).
CREATE OR REPLACE FUNCTION public.referral_stats()
RETURNS TABLE (link_id uuid, total bigint, unique_visitors bigint, today bigint, last_7d bigint, last_30d bigint, last_click timestamptz, top_source text)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT c.link_id,
    count(*),
    count(DISTINCT nullif(c.visitor_hash, '')),
    count(*) FILTER (WHERE c.created_at >= date_trunc('day', now())),
    count(*) FILTER (WHERE c.created_at >= now() - interval '7 days'),
    count(*) FILTER (WHERE c.created_at >= now() - interval '30 days'),
    max(c.created_at),
    (SELECT s.referrer_host FROM public.referral_clicks s
      WHERE s.link_id = c.link_id AND s.referrer_host <> ''
      GROUP BY s.referrer_host ORDER BY count(*) DESC LIMIT 1)
  FROM public.referral_clicks c
  GROUP BY c.link_id
$$;
REVOKE ALL ON FUNCTION public.referral_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.referral_stats() TO authenticated, service_role;