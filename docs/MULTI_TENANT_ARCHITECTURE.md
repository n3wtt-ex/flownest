# Multi-Tenant (Çoklu Kiracı) Mimari Dokümantasyonu

## 🎯 Genel Bakış

FlowNest projesi artık tam bir multi-tenant (çoklu kiracı) mimariye sahiptir. Bu mimari sayesinde:

- Her müşterinin verileri tamamen izole edilmiştir
- Kullanıcılar sadece kendi organizasyonlarının verilerini görebilir ve düzenleyebilir
- Güvenlik Supabase'in Row Level Security (RLS) özelliği ile sağlanmıştır
- Scalable ve secure bir yapı kurulmuştur

## 🏗️ Mimari Bileşenler

### 1. Database Schema

#### Organizations Tablosu
```sql
-- Subscription plan ENUM type
CREATE TYPE subscription_plan_type AS ENUM (
    'starter',
    'professional', 
    'enterprise',
    'developer'
);

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    domain TEXT,
    settings JSONB DEFAULT '{}',
    subscription_plan subscription_plan_type NOT NULL DEFAULT 'starter',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### User Organizations Junction Table
```sql
CREATE TABLE user_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);
```

#### Organization ID Sütunları
Tüm ana tablolara `organization_id UUID REFERENCES organizations(id)` sütunu eklenmiştir:
- `owners`
- `companies`
- `contacts`
- `deals`
- `pipelines`
- `pipeline_stages`
- `activities`
- `campaigns`
- `leads`
- `workspace`
- `agent_chat`

### 2. Row Level Security (RLS) Politikaları

Her tablo için aşağıdaki politikalar uygulanmıştır:

```sql
-- Kullanıcılar sadece kendi organizasyonlarının verilerini görebilir
CREATE POLICY "Users can view their organization data" ON {table_name}
    FOR SELECT USING (organization_id = get_current_user_organization_id());

-- Kullanıcılar sadece kendi organizasyonlarının verilerini yönetebilir
CREATE POLICY "Users can manage their organization data" ON {table_name}
    FOR ALL USING (organization_id = get_current_user_organization_id());
```

### 3. Utility Functions

```sql
-- Kullanıcının mevcut organizasyon ID'sini getirir
CREATE FUNCTION get_current_user_organization_id() RETURNS UUID

-- Insert sırasında otomatik organization_id ataması
CREATE FUNCTION auto_set_organization_id() RETURNS TRIGGER
```

## 🔧 Frontend Entegrasyonu

### 1. TypeScript Types
- `src/types/organizations.ts` - Organizasyon ile ilgili tüm type'lar
- Mevcut entity type'ları organization desteği için genişletilmiştir

### 2. Context Provider
- `src/contexts/OrganizationContext.tsx` - Organizasyon state yönetimi
- Organizasyon değiştirme, güncelleme, üye yönetimi fonksiyonları

### 3. UI Components
- `src/components/Organization/OrganizationSelector.tsx` - Organizasyon seçici dropdown
- Header'a entegre edilmiş organizasyon seçici

### 4. App Integration
- `App.tsx` güncellenerek OrganizationProvider eklenmiştir
- Tüm authenticated route'lar organizasyon context'i altında çalışır

## 🚀 Kullanım Kılavuzu

### 1. Yeni Kullanıcı Kaydı
- Kullanıcı kayıt olduğunda otomatik olarak bir default organizasyon oluşturulur
- Kullanıcı bu organizasyonun 'owner'ı olarak atanır

### 2. Organizasyon Yönetimi
- Header'daki organizasyon selector'ü ile organizasyonlar arası geçiş
- Organizasyon ayarları ve üye yönetimi (gelecek sürümlerde)

### 3. Veri İzolasyonu
- Tüm CRUD işlemleri organizasyon bazında filtrelenir
- Kullanıcılar sadece kendi organizasyonlarının verilerini görür

## 🛡️ Güvenlik Özellikleri

### 1. Row Level Security (RLS)
- Tüm tablolarda RLS etkinleştirilmiştir
- Database seviyesinde veri izolasyonu garantisi

### 2. Function Security
- Utility function'lar SECURITY DEFINER ile güvenli hale getirilmiştir
- Kullanıcı doğrulaması auth.uid() ile yapılır

### 3. Automatic Organization Assignment
- Yeni veriler otomatik olarak kullanıcının organizasyonuna atanır
- Manuel organization_id manipülasyonu engellenir

## 📊 Performans Optimizasyonları

### 1. Database Indexes
Tüm organization_id sütunlarında index'ler oluşturulmuştur:
```sql
CREATE INDEX idx_{table_name}_org_id ON {table_name}(organization_id);
```

### 2. Query Optimization
- Organization bazlı filtreleme database seviyesinde yapılır
- Frontend'de ek filtreleme gereksizdir

## 🔄 Migration Süreci

### 1. Mevcut Veri Migrasyonu
- Tüm mevcut veriler default organizasyona atanmıştır
- Migration script: `db/migrations/migrate_existing_data.sql`

### 2. Verification
Migration sonrası doğrulama sorguları ile veri bütünlüğü kontrol edilmiştir.

## 🎛️ Konfigürasyon

### 1. Environment Variables
Mevcut Supabase konfigürasyonu yeterlidir, ek environment variable gerekmez.

### 2. Frontend Configuration
- OrganizationProvider App.tsx'te konfigüre edilmiştir
- LocalStorage kullanılarak son seçilen organizasyon hatırlanır

## 🧪 Test Önerileri

### 1. Manual Testing
- Farklı kullanıcılarla kayıt olun
- Organizasyonlar arası veri izolasyonunu test edin
- RLS politikalarının doğru çalıştığını kontrol edin

### 2. Automated Testing
- Unit testler organizasyon context'i için yazılabilir
- Integration testler RLS politikaları için önerilir

## 🔮 Gelecek Geliştirmeler

### 1. İnvitation System
- Email ile kullanıcı davet etme
- Davet onaylama sistemi

### 2. Advanced Organization Management
- Organizasyon ayarları sayfası
- Üye rolü yönetimi
- Subscription plan yönetimi

### 3. Analytics & Reporting
- Organizasyon bazlı raporlama
- Multi-tenant analytics dashboard

## ⚠️ Önemli Notlar

### 1. Migration Sonrası Kontroller
- Tüm mevcut veriler migration ile default organizasyona atanmıştır
- Yeni kullanıcılar için test yapın
- RLS politikalarının doğru çalıştığını doğrulayın

### 2. Backup Önerisi
- Multi-tenant migration öncesi database backup'ı alınması önerilir
- Production'da deploy öncesi staging'de test edilmesi kritiktir

### 3. Development Workflow
- Yeni feature'lar organization_id desteği ile geliştirilmelidir
- Database migration'ları organizasyon bazlı test edilmelidir

## 📞 Destek

Multi-tenant implementasyonu ile ilgili sorularınız için:
- Database schema değişiklikleri için migration script'leri kontrol edin
- Frontend entegrasyonu için OrganizationContext'i inceleyin
- RLS politikaları için database function'ları gözden geçirin