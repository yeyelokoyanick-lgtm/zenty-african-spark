
-- product-images: public read, owner-only writes (folder = user_id)
CREATE POLICY "Product images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Users upload their own product images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update their own product images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete their own product images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- digital-files: owner-only everything (no anon)
CREATE POLICY "Owners read their own digital files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'digital-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners upload their own digital files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'digital-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners update their own digital files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'digital-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners delete their own digital files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'digital-files' AND auth.uid()::text = (storage.foldername(name))[1]);
