-- Kullanıcı iletişim bilgileri tablosu
CREATE TABLE IF NOT EXISTS users_contact_info (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  company TEXT,
  website TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- updated_at alanını otomatik olarak güncelle
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_contact_info_updated_at 
  BEFORE UPDATE ON users_contact_info 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();