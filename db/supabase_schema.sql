-- Create emails table
create table if not exists emails (
  id uuid default gen_random_uuid() primary key,
  sender text not null,
  content text not null,
  tag text not null check (tag in ('İlgili', 'İlgisiz', 'Soru Soruyor')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert mock data
insert into emails (id, sender, content, tag, created_at) values
('1', 'john@techcorp.com', 'Merhaba, ürününüz hakkında daha fazla bilgi almak istiyorum. Fiyatlandırma konusunda görüşebilir miyiz?', 'İlgili', '2024-01-15T10:30:00Z'),
('2', 'sarah@innovate.io', 'Teşekkürler ama şu anda böyle bir çözüme ihtiyacımız yok. İyi günler.', 'İlgisiz', '2024-01-15T11:45:00Z'),
('3', 'mike@startup.co', 'İlginç görünüyor. Kaç kullanıcıya kadar destekliyor? Entegrasyon süreci nasıl işliyor?', 'Soru Soruyor', '2024-01-15T14:20:00Z'),
('4', 'lisa@company.com', 'Demo talep ediyorum. Bu hafta müsait olduğunuz bir zaman var mı?', 'İlgili', '2024-01-15T15:10:00Z'),
('5', 'david@business.net', 'Şu anda başka bir çözüm kullanıyoruz ve memnunuz. Teşekkürler.', 'İlgisiz', '2024-01-15T16:30:00Z'),
('6', 'anna@enterprise.org', 'Güvenlik sertifikalarınız neler? GDPR uyumluluğu var mı?', 'Soru Soruyor', '2024-01-15T17:15:00Z');