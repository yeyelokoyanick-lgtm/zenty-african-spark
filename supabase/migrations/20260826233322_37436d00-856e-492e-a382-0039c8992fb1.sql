-- helper: first path segment is the owner uid
DO $$
DECLARE b text;
BEGIN
  FOREACH b IN ARRAY ARRAY['avatars','store-assets','product-images','digital-products','digital-files']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', b || '_owner_insert');
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', b || '_owner_select');
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', b || '_owner_update');
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', b || '_owner_delete');

    EXECUTE format($f$CREATE POLICY %I ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = %L AND (storage.foldername(name))[1] = auth.uid()::text)$f$, b || '_owner_insert', b);
    EXECUTE format($f$CREATE POLICY %I ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id = %L AND (storage.foldername(name))[1] = auth.uid()::text)$f$, b || '_owner_select', b);
    EXECUTE format($f$CREATE POLICY %I ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = %L AND (storage.foldername(name))[1] = auth.uid()::text)
      WITH CHECK (bucket_id = %L AND (storage.foldername(name))[1] = auth.uid()::text)$f$, b || '_owner_update', b, b);
    EXECUTE format($f$CREATE POLICY %I ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = %L AND (storage.foldername(name))[1] = auth.uid()::text)$f$, b || '_owner_delete', b);
  END LOOP;
END $$;

-- storefront assets readable by visitors (images only; never digital files)
DROP POLICY IF EXISTS "storefront_assets_public_read" ON storage.objects;
CREATE POLICY "storefront_assets_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('product-images','store-assets','avatars'));