-- Public blog image hosting: everyone can view, only admins can write
create policy "Public can view media"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "Admins can upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can update media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));