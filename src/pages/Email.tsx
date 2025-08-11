import React from 'react';
import { Mail, Settings, Shield, Zap } from 'lucide-react';

export function Email() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Hesabı</h1>
          <p className="text-gray-600 text-lg">
            E-posta hesaplarınızı yönetin ve kampanyalarınızı optimize edin
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Geliştiriliyor</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Email hesabı yönetimi modülü, e-posta hesaplarınızı güvenli bir şekilde 
            bağlamanızı ve kampanyalarınız için optimize etmenizi sağlayacak.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 bg-green-50 rounded-lg">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Güvenli Bağlantı</h3>
              <p className="text-sm text-gray-600">
                E-posta hesaplarınızı güvenli şekilde bağlayın
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <Mail className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Çoklu Hesap</h3>
              <p className="text-sm text-gray-600">
                Birden fazla e-posta hesabını yönetin
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <Zap className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Otomatik Ayarlar</h3>
              <p className="text-sm text-gray-600">
                Kampanyalar için otomatik optimizasyon
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Planlanan Özellikler:</h3>
            <ul className="text-left text-gray-600 space-y-2 max-w-md mx-auto">
              <li>• Gmail, Outlook ve diğer sağlayıcı desteği</li>
              <li>• E-posta deliverability optimizasyonu</li>
              <li>• Spam skorlama ve iyileştirme önerileri</li>
              <li>• Otomatik warm-up süreçleri</li>
              <li>• Detaylı performans analitikleri</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}