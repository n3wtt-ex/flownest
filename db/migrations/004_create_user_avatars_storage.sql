-- Kullanıcı profil resimleri için storage bucket oluşturma
INSERT INTO storage.buckets (id, name, public)
VALUES ('user_avatars', 'user_avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Kullanıcı avatarları için RLS kuralları
CREATE POLICY "Kullanıcılar kendi avatarlarını yükleyebilir" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'user_avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Kullanıcılar kendi avatarlarını güncelleyebilir" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'user_avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Kullanıcılar kendi avatarlarını silebilir" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'user_avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Avatarlara herkes erişebilir" ON storage.objects
FOR SELECT TO authenticated, anon
USING (bucket_id = 'user_avatars');