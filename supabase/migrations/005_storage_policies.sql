-- Storage policies for avatars bucket
-- Allow authenticated users to upload and update their own avatars

-- Policy: Users can upload their own avatars
create policy "Users can upload own avatar"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own avatars
create policy "Users can update own avatar"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own avatars
create policy "Users can delete own avatar"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Anyone can view avatars (public bucket)
create policy "Public avatars are viewable"
on storage.objects for select
to public
using (bucket_id = 'avatars');
