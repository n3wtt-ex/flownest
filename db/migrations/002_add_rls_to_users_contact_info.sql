-- users_contact_info tablosu için RLS (Row Level Security) kuralları
ALTER TABLE users_contact_info ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi verilerini okuyabilir
CREATE POLICY "Kullanıcılar kendi iletişim bilgilerini okuyabilir" ON users_contact_info
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Kullanıcılar kendi verilerini ekleyebilir
CREATE POLICY "Kullanıcılar kendi iletişim bilgilerini ekleyebilir" ON users_contact_info
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi verilerini güncelleyebilir
CREATE POLICY "Kullanıcılar kendi iletişim bilgilerini güncelleyebilir" ON users_contact_info
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);