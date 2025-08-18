# E-posta Yanıt Takibi

Bu proje, e-posta yanıtlarını kategorize etmek ve uygun aksiyonları almak için geliştirilmiş bir uygulamadır.

## Özellikler

- E-posta yanıtlarını "İlgili", "İlgisiz" ve "Soru Soruyor" olarak kategorize etme
- Sürükle-bırak ile kategori değiştirme
- Her kategori için özel aksiyonlar
- Webhook entegrasyonu ile toplantı ayarlama
- Supabase entegrasyonu ile veri saklama ve çekme

## Kurulum

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. Supabase yapılandırması:
   - `.env.example` dosyasını kopyalayarak `.env` dosyası oluşturun
   - Supabase dashboard'unuzdan Project URL ve anon public key değerlerini alın
   - Bu değerleri `.env` dosyasındaki ilgili alanlara yapıştırın:
     ```
     VITE_SUPABASE_URL=buraya_supabase_proje_url'nizi_yazın
     VITE_SUPABASE_ANON_KEY=buraya_supabase_anon_key'inizi_yazın
     ```

3. Supabase tablosunu oluşturma:
   - `db/supabase_schema.sql` dosyasındaki SQL komutlarını Supabase SQL editöründe çalıştırın

4. Uygulamayı başlatın:
   ```bash
   npm run dev
   ```

## Kullanım

- E-posta kartlarını sürükle-bırak ile farklı kategorilere taşıyabilirsiniz
- Her kategoriye özel aksiyon butonları mevcuttur
- "Toplantı Ayarla" butonu ile webhook entegrasyonu yapılabilir