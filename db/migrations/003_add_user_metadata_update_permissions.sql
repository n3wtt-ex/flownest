-- Kullanıcıların kendi profil bilgilerini güncellemesi için gerekli izinler
CREATE OR REPLACE FUNCTION update_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() = NEW.id THEN
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'İzinsiz işlem: Sadece kendi profilinizi güncelleyebilirsiniz.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcıların kendi metadata bilgilerini güncellemesi için RLS politikası
CREATE POLICY "Kullanıcılar kendi metadata bilgilerini güncelleyebilir" 
ON auth.users
FOR UPDATE TO authenticated
USING (auth.uid() = id);