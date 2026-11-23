CREATE OR REPLACE FUNCTION public.consume_site_check(_ip text, _host text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF _ip IS NULL OR _host IS NULL OR length(_ip) > 100 OR length(_host) > 255 THEN
    RETURN false;
  END IF;
  -- Always lock visitor first, then target website, so concurrent calls cannot deadlock.
  PERFORM pg_advisory_xact_lock(hashtextextended('site-check-ip:' || _ip, 0));
  PERFORM pg_advisory_xact_lock(hashtextextended('site-check-host:' || _host, 0));
  IF (SELECT count(*) FROM public.rate_limits WHERE ip = 'tool:' || _ip AND created_at > now() - interval '1 minute') >= 20 THEN
    RETURN false;
  END IF;
  IF (SELECT count(*) FROM public.rate_limits WHERE ip = 'host:' || _host AND created_at > now() - interval '10 minutes') >= 30 THEN
    RETURN false;
  END IF;
  INSERT INTO public.rate_limits(ip) VALUES ('tool:' || _ip), ('host:' || _host);
  DELETE FROM public.rate_limits WHERE ip IN ('tool:' || _ip, 'host:' || _host) AND created_at < now() - interval '1 hour';
  RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.consume_site_check(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_site_check(text, text) TO service_role;