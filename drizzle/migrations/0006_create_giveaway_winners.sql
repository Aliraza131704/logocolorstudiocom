CREATE TABLE public.giveaway_winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month text NOT NULL UNIQUE,
  name text NOT NULL,
  email text NOT NULL,
  wallet text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.giveaway_winners TO anon;
GRANT SELECT, INSERT, DELETE ON public.giveaway_winners TO authenticated;
GRANT ALL ON public.giveaway_winners TO service_role;
ALTER TABLE public.giveaway_winners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read winners" ON public.giveaway_winners FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write winners" ON public.giveaway_winners FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admin delete winners" ON public.giveaway_winners FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));