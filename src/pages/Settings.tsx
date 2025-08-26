import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../components/ui/theme-provider';

interface ContactInfo {
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  company?: string;
  website?: string;
}

export function Settings() {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.user_metadata?.avatar_url || null);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
    company: '',
    website: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Kullanıcı iletişim bilgilerini veritabanından çek
  useEffect(() => {
    const fetchContactInfo = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('users_contact_info')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (data) {
            setContactInfo({
              phone: data.phone || '',
              address: data.address || '',
              city: data.city || '',
              country: data.country || '',
              postal_code: data.postal_code || '',
              company: data.company || '',
              website: data.website || ''
            });
          } else if (error) {
            // Tablo bulunamazsa veya kayıt yoksa varsayılan değerleri kullan
            console.warn('Contact info not found or table does not exist:', error.message);
            // Yeni bir kayıt oluşturmayı deneyebiliriz
            const { error: insertError } = await supabase
              .from('users_contact_info')
              .insert({
                user_id: user.id,
                phone: '',
                address: '',
                city: '',
                country: '',
                postal_code: '',
                company: '',
                website: ''
              });
            
            if (insertError) {
              console.error('Error creating contact info record:', insertError.message);
            }
          }
          
          if (user.user_metadata?.avatar_url) {
            setAvatarUrl(user.user_metadata.avatar_url);
          }
        } catch (error) {
          console.error('Error fetching contact info:', error);
        }
      }
    };

    fetchContactInfo();
    
    // Dil ayarlarını localStorage'dan yükle
    const savedLanguage = localStorage.getItem('language');
    
    if (savedLanguage === 'en') {
      setLanguage('en');
    }
  }, [user]);

  // Tema değiştirme işlevi
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    console.log('Tema değiştirildi:', newTheme);
  };

  // Dil değiştirme işlevi
  const toggleLanguage = () => {
    const newLanguage = language === 'tr' ? 'en' : 'tr';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    console.log('Dil değiştirildi:', newLanguage);
    
    // Sayfayı yeniden yükleyerek tüm bileşenin dili almasını sağla
    window.location.reload();
  };

  // Avatar yükleme fonksiyonu
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Dosya seçilmedi');
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/avatar.${fileExt}`;
      const filePath = `user_avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('user_avatars')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage
        .from('user_avatars')
        .getPublicUrl(filePath);
      
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: data.publicUrl
        }
      });
      
      if (updateError) {
        throw updateError;
      }
      
      setAvatarUrl(data.publicUrl);
      setMessage({ type: 'success', text: 'Profil fotoğrafı başarıyla güncellendi.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Profil fotoğrafı yüklenirken bir hata oluştu.' });
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  // Avatar silme fonksiyonu
  const deleteAvatar = async () => {
    try {
      if (!avatarUrl || !user) return;
      
      const urlParts = avatarUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `user_avatars/${user.id}/avatar.${fileName.split('.').pop()}`;
      
      const { error } = await supabase.storage
        .from('user_avatars')
        .remove([filePath]);
        
      if (error) {
        throw error;
      }
      
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: null
        }
      });
      
      if (updateError) {
        throw updateError;
      }
      
      setAvatarUrl(null);
      setMessage({ type: 'success', text: 'Profil fotoğrafı başarıyla silindi.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Profil fotoğrafı silinirken bir hata oluştu.' });
      console.error('Error deleting avatar:', error);
    }
  };

  // Kullanıcı bilgilerini güncelleme fonksiyonu
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: avatarUrl
        }
      });

      if (error) throw error;

      const { error: contactError } = await supabase
        .from('users_contact_info')
        .upsert({
          user_id: user?.id,
          ...contactInfo,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (contactError) throw contactError;

      setMessage({ type: 'success', text: 'Profil bilgileriniz başarıyla güncellendi.' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Bilgiler güncellenirken bir hata oluştu.' });
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-violet-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent mb-3">
            {language === 'tr' ? 'Hesap Ayarları' : 'Account Settings'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'tr' ? 'Profil bilgilerinizi ve iletişim ayarlarınızı modernize edin' : 'Modernize your profile information and communication settings'}
          </p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-8 p-4 rounded-2xl backdrop-blur-sm border ${
            message.type === 'success' 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800' 
              : 'bg-red-50/80 border-red-200 text-red-800'
          } transform transition-all duration-300 animate-pulse`}>
            <div className="flex items-center">
              <div className={`flex-shrink-0 w-5 h-5 rounded-full ${
                message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
              } mr-3`}></div>
              {message.text}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Profile Card - Sol Panel */}
          <div className="xl:col-span-4">
            <div className="sticky top-8">
              <div className="group relative">
                {/* Glassmorphism Effect */}
                <div className="absolute inset-0 bg-card/60 backdrop-blur-xl rounded-3xl border border-border shadow-2xl shadow-black/10"></div>
                
                {/* Content */}
                <div className="relative p-8">
                  <div className="text-center">
                    {/* Avatar Section */}
                    <div className="relative inline-block mb-6">
                      <div className="relative w-32 h-32 mx-auto">
                        {/* Animated Ring */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full animate-spin-slow opacity-20"></div>
                        <div className="absolute inset-1 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full overflow-hidden shadow-2xl">
                          {avatarUrl ? (
                            <img 
                              src={avatarUrl} 
                              alt="Profil" 
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold bg-gradient-to-br from-blue-600 to-purple-600">
                              {fullName ? fullName.charAt(0) : user?.email?.charAt(0) || 'Y'}
                            </div>
                          )}
                        </div>
                        
                        {/* Edit Buttons */}
                        {isEditing && (
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="group p-3 bg-card/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-border"
                              disabled={uploading}
                            >
                              {uploading ? (
                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <svg className="w-5 h-5 text-blue-600 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              )}
                            </button>
                            
                            {avatarUrl && (
                              <button
                                onClick={deleteAvatar}
                                className="group p-3 bg-card/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-border"
                              >
                                <svg className="w-5 h-5 text-red-600 group-hover:text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={uploadAvatar}
                        className="hidden"
                        disabled={uploading}
                      />
                    </div>

                    {/* User Info */}
                    <h2 className="text-2xl font-bold text-card-foreground mb-2">
                      {fullName || 'Kullanıcı'}
                    </h2>
                    <p className="text-muted-foreground mb-4 font-medium">{user?.email}</p>
                    
                    {/* Status Badge */}
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-semibold shadow-lg shadow-blue-500/25 mb-6">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      {user?.role || 'authenticated'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Details Card */}
              <div className="mt-6 group relative">
                <div className="absolute inset-0 bg-card/60 backdrop-blur-xl rounded-3xl border border-border shadow-2xl shadow-black/10"></div>
                <div className="relative p-6">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center">
                    <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-3"></div>
                    Hesap Detayları
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="group p-4 rounded-2xl bg-card/50 border border-border hover:shadow-lg transition-all duration-300">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Üyelik Tarihi</p>
                      <p className="text-foreground font-semibold">10.08.2025</p>
                    </div>
                    
                    <div className="group p-4 rounded-2xl bg-card/50 border border-border hover:shadow-lg transition-all duration-300">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Kullanıcı ID</p>
                      <p className="text-foreground font-mono text-sm">e07218f6...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Sağ Panel */}
          <div className="xl:col-span-8">
            {/* Profile Information Card */}
            <div className="group relative mb-8">
              <div className="absolute inset-0 bg-card/60 backdrop-blur-xl rounded-3xl border border-border shadow-2xl shadow-black/10"></div>
              
              <div className="relative p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                  <div className="flex items-center mb-4 sm:mb-0">
                    <div className="w-3 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-4"></div>
                    <h2 className="text-2xl font-bold text-card-foreground">{language === 'tr' ? 'Profil Bilgileri' : 'Profile Information'}</h2>
                  </div>
                  
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5 mr-2 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {language === 'tr' ? (isEditing ? 'İptal' : 'Düzenle') : (isEditing ? 'Cancel' : 'Edit')}
                  </button>
                </div>

                {/* Form or Display Content */}
                {isEditing ? (
                  <form onSubmit={updateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Ad Soyad */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-foreground mb-2">{language === 'tr' ? 'Ad Soyad' : 'Full Name'}</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-3 bg-background/70 backdrop-blur-sm border-2 border-border rounded-xl focus:border-ring focus:ring-4 focus:ring-ring/20 transition-all duration-300 hover:border-muted-foreground text-foreground placeholder-muted-foreground"
                            placeholder="Adınızı ve soyadınızı girin"
                          />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>
                      
                      {/* E-posta */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-foreground mb-2">E-posta</label>
                        <div className="relative">
                          <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-4 py-3 bg-muted/50 backdrop-blur-sm border-2 border-border rounded-xl text-muted-foreground cursor-not-allowed"
                          />
                          <div className="absolute right-3 top-3">
                            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* Telefon */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-foreground mb-2">{language === 'tr' ? 'Telefon' : 'Phone'}</label>
                        <div className="relative">
                          <input
                            type="tel"
                            value={contactInfo.phone || ''}
                            onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                            className="w-full px-4 py-3 bg-background/70 backdrop-blur-sm border-2 border-border rounded-xl focus:border-ring focus:ring-4 focus:ring-ring/20 transition-all duration-300 hover:border-muted-foreground text-foreground placeholder-muted-foreground"
                            placeholder={language === 'tr' ? 'Telefon numaranız' : 'Your phone number'}
                          />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>
                      
                      {/* Şirket */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-foreground mb-2">{language === 'tr' ? 'Şirket' : 'Company'}</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={contactInfo.company || ''}
                            onChange={(e) => setContactInfo({...contactInfo, company: e.target.value})}
                            className="w-full px-4 py-3 bg-background/70 backdrop-blur-sm border-2 border-border rounded-xl focus:border-ring focus:ring-4 focus:ring-ring/20 transition-all duration-300 hover:border-muted-foreground text-foreground placeholder-muted-foreground"
                            placeholder={language === 'tr' ? 'Şirket adınız' : 'Your company name'}
                          />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>
                      
                      {/* Web Sitesi */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-foreground mb-2">{language === 'tr' ? 'Web Sitesi' : 'Website'}</label>
                        <div className="relative">
                          <input
                            type="url"
                            value={contactInfo.website || ''}
                            onChange={(e) => setContactInfo({...contactInfo, website: e.target.value})}
                            className="w-full px-4 py-3 bg-background/70 backdrop-blur-sm border-2 border-border rounded-xl focus:border-ring focus:ring-4 focus:ring-ring/20 transition-all duration-300 hover:border-muted-foreground text-foreground placeholder-muted-foreground"
                            placeholder={language === 'tr' ? 'https://example.com' : 'https://example.com'}
                          />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>
                      
                      {/* Ülke */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-foreground mb-2">{language === 'tr' ? 'Ülke' : 'Country'}</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={contactInfo.country || ''}
                            onChange={(e) => setContactInfo({...contactInfo, country: e.target.value})}
                            className="w-full px-4 py-3 bg-background/70 backdrop-blur-sm border-2 border-border rounded-xl focus:border-ring focus:ring-4 focus:ring-ring/20 transition-all duration-300 hover:border-muted-foreground text-foreground placeholder-muted-foreground"
                            placeholder={language === 'tr' ? 'Ülkeniz' : 'Your country'}
                          />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>
                      
                      {/* Şehir */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-foreground mb-2">Şehir</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={contactInfo.city || ''}
                            onChange={(e) => setContactInfo({...contactInfo, city: e.target.value})}
                            className="w-full px-4 py-3 bg-background/70 backdrop-blur-sm border-2 border-border rounded-xl focus:border-ring focus:ring-4 focus:ring-ring/20 transition-all duration-300 hover:border-muted-foreground text-foreground placeholder-muted-foreground"
                            placeholder="Şehir"
                          />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>
                      
                      {/* Posta Kodu */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-foreground mb-2">{language === 'tr' ? 'Posta Kodu' : 'Postal Code'}</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={contactInfo.postal_code || ''}
                            onChange={(e) => setContactInfo({...contactInfo, postal_code: e.target.value})}
                            className="w-full px-4 py-3 bg-background/70 backdrop-blur-sm border-2 border-border rounded-xl focus:border-ring focus:ring-4 focus:ring-ring/20 transition-all duration-300 hover:border-muted-foreground text-foreground placeholder-muted-foreground"
                            placeholder={language === 'tr' ? 'Posta kodunuz' : 'Your postal code'}
                          />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Adres */}
                    <div className="group">
                                              <label className="block text-sm font-semibold text-foreground mb-2">{language === 'tr' ? 'Adres' : 'Address'}</label>
                      <div className="relative">
                        <textarea
                          value={contactInfo.address || ''}
                          onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
                          rows={4}
                          className="w-full px-4 py-3 bg-background/70 backdrop-blur-sm border-2 border-border rounded-xl focus:border-ring focus:ring-4 focus:ring-ring/20 transition-all duration-300 hover:border-muted-foreground resize-none text-foreground placeholder-muted-foreground"
                          placeholder={language === 'tr' ? 'Tam adresiniz' : 'Your full address'}
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-border">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-3 text-muted-foreground hover:text-foreground font-semibold rounded-xl hover:bg-muted/50 transition-all duration-300"
                      >
                        {language === 'tr' ? 'İptal' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <div className="flex items-center">
                          <span>{language === 'tr' ? 'Değişiklikleri Kaydet' : 'Save Changes'}</span>
                          {loading && (
                            <svg className="animate-spin -mr-1 ml-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                        </div>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Display Mode Fields */}
                      {[
                        { label: 'Ad Soyad', value: fullName || 'Belirtilmemiş', icon: '👤' },
                        { label: 'E-posta', value: user?.email, icon: '📧' },
                        { label: 'Telefon', value: contactInfo.phone || 'Belirtilmemiş', icon: '📞' },
                        { label: 'Şirket', value: contactInfo.company || 'Belirtilmemiş', icon: '🏢' },
                        { label: 'Web Sitesi', value: contactInfo.website || 'Belirtilmemiş', icon: '🌐', isLink: true },
                        { label: 'Ülke', value: contactInfo.country || 'Belirtilmemiş', icon: '🌍' },
                        { label: 'Şehir', value: contactInfo.city || 'Belirtilmemiş', icon: '🏙️' },
                        { label: 'Posta Kodu', value: contactInfo.postal_code || 'Belirtilmemiş', icon: '📮' }
                      ].map((field, index) => (
                        <div key={field.label} className="group p-5 rounded-2xl bg-card/60 backdrop-blur-sm border border-border hover:shadow-lg hover:border-ring/50 transition-all duration-300 hover:scale-105" style={{animationDelay: `${index * 0.1}s`}}>
                          <div className="flex items-center mb-2">
                            <span className="text-lg mr-2">{field.icon}</span>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{field.label}</p>
                          </div>
                          {field.isLink && field.value !== 'Belirtilmemiş' ? (
                            <a 
                              href={field.value} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors duration-300"
                            >
                              {field.value}
                            </a>
                          ) : (
                            <p className="text-foreground font-semibold">{field.value}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Adres - Full Width */}
                    <div className="group p-5 rounded-2xl bg-card/60 backdrop-blur-sm border border-border hover:shadow-lg hover:border-ring/50 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center mb-2">
                        <span className="text-lg mr-2">📍</span>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Adres</p>
                      </div>
                      <p className="text-foreground font-semibold">{contactInfo.address || 'Belirtilmemiş'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Settings Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-card/60 backdrop-blur-xl rounded-3xl border border-border shadow-2xl shadow-black/10"></div>
              
              <div className="relative p-8">
                <div className="flex items-center mb-8">
                  <div className="w-3 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full mr-4"></div>
                  <h2 className="text-2xl font-bold text-foreground">{language === 'tr' ? 'Hesap Ayarları' : 'Account Settings'}</h2>
                </div>
                
                {/* Tema ve Dil Ayarları */}
                <div className="space-y-6 mb-8">
                  {/* Tema Ayarı */}
                  <div className="group p-6 rounded-2xl bg-card/50 border border-border hover:shadow-lg hover:border-ring/50 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-lg">{language === 'tr' ? 'Tema Ayarı' : 'Theme Setting'}</h3>
                          <p className="text-muted-foreground">{language === 'tr' ? 'Açık veya koyu tema arasında geçiş yapın' : 'Switch between light and dark themes'}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <button 
                          onClick={toggleTheme}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
                            theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="ml-3 text-sm font-medium text-foreground">
                          {language === 'tr' ? (theme === 'dark' ? 'Koyu' : 'Açık') : (theme === 'dark' ? 'Dark' : 'Light')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Dil Ayarı */}
                  <div className="group p-6 rounded-2xl bg-card/50 border border-border hover:shadow-lg hover:border-ring/50 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-lg">{language === 'tr' ? 'Dil Ayarı' : 'Language Setting'}</h3>
                          <p className="text-muted-foreground">{language === 'tr' ? 'Uygulama dilini değiştirin' : 'Change application language'}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <button 
                          onClick={toggleLanguage}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
                            language === 'en' ? 'bg-purple-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              language === 'en' ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="ml-3 text-sm font-medium text-foreground">
                          {language === 'tr' ? (language === 'tr' ? 'Türkçe' : 'İngilizce') : (language === 'tr' ? 'Turkish' : 'English')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Şifre Değiştir */}
                  <div className="group p-6 rounded-2xl bg-card/50 border border-border hover:shadow-lg hover:border-ring/50 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-lg">{language === 'tr' ? 'Şifre Değiştir' : 'Change Password'}</h3>
                          <p className="text-muted-foreground">{language === 'tr' ? 'Şifrenizi güvenli tutun' : 'Keep your password secure'}</p>
                        </div>
                      </div>
                      <button className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center">
                        <span className="mr-2">Düzenle</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Bildirimler */}
                  <div className="group p-6 rounded-2xl bg-card/50 border border-border hover:shadow-lg hover:border-ring/50 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM7 6h5l5 5v5H7V6z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-lg">{language === 'tr' ? 'Bildirimler' : 'Notifications'}</h3>
                          <p className="text-muted-foreground">{language === 'tr' ? 'E-posta ve bildirim tercihlerinizi yönetin' : 'Manage your email and notification preferences'}</p>
                        </div>
                      </div>
                      <button className="group px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center">
                        <span className="mr-2">Yapılandır</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* İki Faktörlü Kimlik Doğrulama */}
                  <div className="group p-6 rounded-2xl bg-card/50 border border-border hover:shadow-lg hover:border-ring/50 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-lg">{language === 'tr' ? 'İki Faktörlü Kimlik Doğrulama' : 'Two-Factor Authentication'}</h3>
                          <p className="text-muted-foreground">{language === 'tr' ? 'Hesabınızı ek güvenlik ile koruyun' : 'Protect your account with additional security'}</p>
                        </div>
                      </div>
                      
                      {/* Advanced Toggle Switch */}
                      <div className="relative">
                        <input type="checkbox" id="2fa-toggle" className="sr-only" />
                        <label htmlFor="2fa-toggle" className="relative inline-flex items-center cursor-pointer">
                          <div className="w-16 h-8 bg-gray-300 rounded-full shadow-inner transition-all duration-300 hover:bg-gray-400">
                            <div className="w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 translate-x-1 mt-1"></div>
                          </div>
                          <div className="absolute inset-0 w-16 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full opacity-0 transition-opacity duration-300 peer-checked:opacity-100">
                            <div className="w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 translate-x-9 mt-1"></div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom Styles */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .toggle-checkbox:checked {
          right: 0;
          border-color: #10b981;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #10b981;
        }
        
        /* Hover effects for form inputs */
        input:focus, textarea:focus {
          transform: translateY(-1px);
        }
        
        /* Glassmorphism hover effects */
        .group:hover .absolute {
          background: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%);
        }
      `}</style>
    </div>
  );
}