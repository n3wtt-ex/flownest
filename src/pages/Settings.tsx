import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

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
        }
        
        // Avatar URL'sini de güncelle
        if (user.user_metadata?.avatar_url) {
          setAvatarUrl(user.user_metadata.avatar_url);
        }
      }
    };

    fetchContactInfo();
  }, [user]);

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
      
      // Avatar URL'sini al
      const { data } = supabase.storage
        .from('user_avatars')
        .getPublicUrl(filePath);
      
      // Kullanıcı meta verilerini güncelle
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
      
      // Dosya yolunu çıkar
      const urlParts = avatarUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `user_avatars/${user.id}/avatar.${fileName.split('.').pop()}`;
      
      const { error } = await supabase.storage
        .from('user_avatars')
        .remove([filePath]);
        
      if (error) {
        throw error;
      }
      
      // Kullanıcı meta verilerini güncelle
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
      // Supabase'de kullanıcı meta verilerini güncelle
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: avatarUrl
        }
      });

      if (error) throw error;

      // İletişim bilgilerini özel tabloya kaydet (users_contact_info)
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hesap Ayarları</h1>
        <p className="text-gray-600 mt-2">Profil bilgilerinizi ve iletişim ayarlarınızı yönetin</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Panel - Profil Bilgileri */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 overflow-hidden">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Profil" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    fullName ? fullName.charAt(0) : user?.email?.charAt(0) || 'U'
                  )}
                </div>
                {isEditing && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1 bg-white rounded-full shadow text-blue-600 hover:bg-gray-50"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                    {avatarUrl && (
                      <button
                        onClick={deleteAvatar}
                        className="p-1 bg-white rounded-full shadow text-red-600 hover:bg-gray-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <h2 className="text-xl font-bold text-gray-900">{fullName || 'Kullanıcı'}</h2>
              <p className="text-gray-600 mt-1">{user?.email}</p>
              <div className="mt-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {user?.role || 'Kullanıcı'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hesap Detayları</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase">Üyelik Tarihi</p>
                <p className="text-gray-900">{user?.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Kullanıcı ID</p>
                <p className="text-gray-900 font-mono text-sm">{user?.id?.substring(0, 8)}...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Panel - Formlar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Profil Bilgileri</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
              >
                {isEditing ? 'İptal' : 'Düzenle'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={updateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Adınızı ve soyadınızı girin"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      placeholder="E-posta adresiniz"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                    <input
                      type="tel"
                      value={contactInfo.phone || ''}
                      onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Telefon numaranız"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Şirket</label>
                    <input
                      type="text"
                      value={contactInfo.company || ''}
                      onChange={(e) => setContactInfo({...contactInfo, company: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Şirket adı"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Web Sitesi</label>
                    <input
                      type="url"
                      value={contactInfo.website || ''}
                      onChange={(e) => setContactInfo({...contactInfo, website: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ülke</label>
                    <input
                      type="text"
                      value={contactInfo.country || ''}
                      onChange={(e) => setContactInfo({...contactInfo, country: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ülke"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
                    <input
                      type="text"
                      value={contactInfo.city || ''}
                      onChange={(e) => setContactInfo({...contactInfo, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Şehir"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Posta Kodu</label>
                    <input
                      type="text"
                      value={contactInfo.postal_code || ''}
                      onChange={(e) => setContactInfo({...contactInfo, postal_code: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Posta kodu"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                    <textarea
                      value={contactInfo.address || ''}
                      onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tam adresiniz"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Ad Soyad</p>
                    <p className="text-gray-900">{fullName || 'Belirtilmemiş'}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase">E-posta</p>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Telefon</p>
                    <p className="text-gray-900">{contactInfo.phone || 'Belirtilmemiş'}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Şirket</p>
                    <p className="text-gray-900">{contactInfo.company || 'Belirtilmemiş'}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Web Sitesi</p>
                    <p className="text-gray-900">
                      {contactInfo.website ? (
                        <a href={contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {contactInfo.website}
                        </a>
                      ) : 'Belirtilmemiş'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Ülke</p>
                    <p className="text-gray-900">{contactInfo.country || 'Belirtilmemiş'}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Şehir</p>
                    <p className="text-gray-900">{contactInfo.city || 'Belirtilmemiş'}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Posta Kodu</p>
                    <p className="text-gray-900">{contactInfo.postal_code || 'Belirtilmemiş'}</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500 uppercase">Adres</p>
                    <p className="text-gray-900">{contactInfo.address || 'Belirtilmemiş'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Hesap Ayarları</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <div>
                  <h3 className="font-medium text-gray-900">Şifre Değiştir</h3>
                  <p className="text-sm text-gray-600">Şifrenizi düzenleyin</p>
                </div>
                <button className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors">
                  Düzenle
                </button>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <div>
                  <h3 className="font-medium text-gray-900">Bildirimler</h3>
                  <p className="text-sm text-gray-600">E-posta ve bildirim tercihlerinizi yönetin</p>
                </div>
                <button className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors">
                  Yapılandır
                </button>
              </div>
              
              <div className="flex justify-between items-center py-3">
                <div>
                  <h3 className="font-medium text-gray-900">İki Faktörlü Kimlik Doğrulama</h3>
                  <p className="text-sm text-gray-600">Hesabınız için ek güvenlik katmanı</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                  <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
