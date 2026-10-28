CREATE TABLE public.giveaway_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  wallet text NOT NULL,
  month text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC','YYYY-MM'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email, month)
);
GRANT INSERT ON public.giveaway_entries TO anon, authenticated;
GRANT SELECT, DELETE ON public.giveaway_entries TO authenticated;
GRANT ALL ON public.giveaway_entries TO service_role;
ALTER TABLE public.giveaway_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone enter" ON public.giveaway_entries FOR INSERT TO anon, authenticated
  WITH CHECK (length(name) BETWEEN 1 AND 100 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 255 AND wallet ~ '^T[1-9A-HJ-NP-Za-km-z]{33}$|^0x[0-9a-fA-F]{40}$' AND month = to_char(now() AT TIME ZONE 'UTC','YYYY-MM'));
CREATE POLICY "admin read entries" ON public.giveaway_entries FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete entries" ON public.giveaway_entries FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));