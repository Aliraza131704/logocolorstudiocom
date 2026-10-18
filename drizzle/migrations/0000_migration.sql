
create type public.app_role as enum ('admin','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.handle_new_user_role() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if lower(new.email) = 'apwebventures01@gmail.com' then insert into public.user_roles(user_id, role) values (new.id,'admin') on conflict do nothing;
  else insert into public.user_roles(user_id, role) values (new.id,'user') on conflict do nothing; end if;
  return new;
end $$;
create trigger on_auth_user_created_role after insert on auth.users for each row execute function public.handle_new_user_role();

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$ begin new.updated_at = now(); return new; end $$;

-- likes
create table public.palette_likes (id uuid primary key default gen_random_uuid(), palette_slug text not null, visitor_id text not null, created_at timestamptz not null default now(), unique(palette_slug, visitor_id));
grant select, insert, delete on public.palette_likes to anon, authenticated; grant all on public.palette_likes to service_role;
alter table public.palette_likes enable row level security;
create policy "read likes" on public.palette_likes for select to anon, authenticated using (true);
create policy "add like" on public.palette_likes for insert to anon, authenticated with check (length(visitor_id) between 8 and 64 and length(palette_slug) between 1 and 120);
create view public.palette_like_counts with (security_invoker = on) as select palette_slug, count(*)::int as likes from public.palette_likes group by palette_slug;
grant select on public.palette_like_counts to anon, authenticated;

-- ad slots
create table public.ad_slots (position text primary key, label text not null, code text not null default '', enabled boolean not null default false, show_desktop boolean not null default true, show_mobile boolean not null default true, updated_at timestamptz not null default now());
grant select on public.ad_slots to anon, authenticated; grant insert, update, delete on public.ad_slots to authenticated; grant all on public.ad_slots to service_role;
alter table public.ad_slots enable row level security;
create policy "public read enabled ads" on public.ad_slots for select to anon, authenticated using (enabled or public.has_role(auth.uid(),'admin'));
create policy "admin write ads" on public.ad_slots for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.ad_slots(position,label) values ('header','Header (below nav)'),('left_sidebar','Left sidebar'),('right_sidebar','Right sidebar'),('in_content','Inside content'),('between_palettes','Between palette rows'),('below_tool','Below tool result'),('footer','Footer'),('mobile_sticky','Mobile sticky');

-- settings (key/value)
create table public.site_settings (key text primary key, value text not null default '', updated_at timestamptz not null default now());
grant select on public.site_settings to anon, authenticated; grant insert, update, delete on public.site_settings to authenticated; grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "public read settings" on public.site_settings for select to anon, authenticated using (true);
create policy "admin write settings" on public.site_settings for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.site_settings(key,value) values ('site_title','LogoColorStudio'),('site_description','Extract, generate and ship brand colors in seconds. Free color tools for designers and developers.'),('contact_email','apwebventures01@gmail.com'),('adsense_head',''),('ads_txt',''),('header_scripts',''),('footer_scripts',''),('robots_extra',''),('social_twitter',''),('social_instagram',''),('social_github',''),('social_dribbble','');

-- pages
create table public.pages (slug text primary key, title text not null, content text not null default '', updated_at timestamptz not null default now());
grant select on public.pages to anon, authenticated; grant insert, update, delete on public.pages to authenticated; grant all on public.pages to service_role;
alter table public.pages enable row level security;
create policy "public read pages" on public.pages for select to anon, authenticated using (true);
create policy "admin write pages" on public.pages for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- blog
create table public.blog_posts (id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null, excerpt text not null default '', content text not null default '', cover_image text not null default '', category text not null default 'Guides', tags text[] not null default '{}', author text not null default 'LogoColorStudio Team', status text not null default 'draft' check (status in ('draft','published')), published_at timestamptz not null default now(), seo_title text not null default '', meta_description text not null default '', canonical text not null default '', og_image text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
grant select on public.blog_posts to anon, authenticated; grant insert, update, delete on public.blog_posts to authenticated; grant all on public.blog_posts to service_role;
alter table public.blog_posts enable row level security;
create policy "public read published" on public.blog_posts for select to anon, authenticated using ((status='published' and published_at <= now()) or public.has_role(auth.uid(),'admin'));
create policy "admin write posts" on public.blog_posts for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger blog_touch before update on public.blog_posts for each row execute function public.touch_updated_at();

-- subscribers & messages
create table public.subscribers (id uuid primary key default gen_random_uuid(), email text not null unique, created_at timestamptz not null default now());
grant insert on public.subscribers to anon, authenticated; grant select, delete on public.subscribers to authenticated; grant all on public.subscribers to service_role;
alter table public.subscribers enable row level security;
create policy "anyone subscribe" on public.subscribers for insert to anon, authenticated with check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 255);
create policy "admin read subs" on public.subscribers for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete subs" on public.subscribers for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.contact_messages (id uuid primary key default gen_random_uuid(), name text not null, email text not null, subject text not null default '', message text not null, created_at timestamptz not null default now());
grant insert on public.contact_messages to anon, authenticated; grant select, delete on public.contact_messages to authenticated; grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;
create policy "anyone send" on public.contact_messages for insert to anon, authenticated with check (length(name) between 1 and 100 and length(email) between 3 and 255 and length(message) between 1 and 5000 and length(subject) <= 200);
create policy "admin read msgs" on public.contact_messages for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete msgs" on public.contact_messages for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- tool usage / visits
create table public.events (id bigserial primary key, kind text not null, name text not null, created_at timestamptz not null default now());
grant insert on public.events to anon, authenticated; grant select on public.events to authenticated; grant all on public.events to service_role;
grant usage on sequence public.events_id_seq to anon, authenticated;
alter table public.events enable row level security;
create policy "log events" on public.events for insert to anon, authenticated with check (kind in ('visit','tool') and length(name) <= 120);
create policy "admin read events" on public.events for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- rate limiting for server fetches
create table public.rate_limits (id bigserial primary key, ip text not null, created_at timestamptz not null default now());
create index on public.rate_limits(ip, created_at);
grant all on public.rate_limits to service_role; grant usage on sequence public.rate_limits_id_seq to service_role;
alter table public.rate_limits enable row level security;
