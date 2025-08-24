import React, { useState, useEffect } from 'react';

interface Step3CardProps {
  onSave: (data: { name: string; companyName: string; companyInfo: string }) => void;
  initialData: { name?: string; companyName?: string; companyInfo?: string };
}

export function Step3Card({ onSave, initialData }: Step3CardProps) {
  const [name, setName] = useState(initialData.name || '');
  const [companyName, setCompanyName] = useState(initialData.companyName || '');
  const [companyInfo, setCompanyInfo] = useState(initialData.companyInfo || '');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setIsValid(name.length > 0 && companyName.length > 0 && companyInfo.length > 0);
  }, [name, companyName, companyInfo]);

  const handleSave = async () => {
    if (isValid) {
      const data = { name, companyName, companyInfo };
      onSave(data);
      
      try {
        const response = await fetch('https://n8n.flownests.org/webhook/541cdb39-b379-4f91-a6d6-90435b58d0a0', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.name,
            company: data.companyName,
            info: data.companyInfo
          }),
        });
        
        if (response.ok) {
          console.log('Company info sent to webhook successfully');
          alert('Veriler başarıyla gönderildi!');
        } else {
          throw new Error(`Webhook error: ${response.status}`);
        }
      } catch (error) {
        console.error('Error sending company info to webhook:', error);
        alert('Veriler webhook\'a gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-3xl shadow-2xl border border-slate-600/50 overflow-hidden backdrop-blur-sm">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-end mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-sm font-medium">Step</span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">3</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white leading-tight">
              Kendinizi tanıtın
            </h2>
            
            <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
              <p className="text-slate-300 text-xs leading-relaxed">
                Kişisel ve şirket bilgilerinizi paylaşın...
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-4">
          <div className="space-y-4">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 text-xs font-medium">
                <div className="flex items-center space-x-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span>İsim</span>
                </div>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adınızı girin"
                className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-sm"
              />
            </div>

            {/* Company Name Input */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 text-xs font-medium">
                <div className="flex items-center space-x-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <span>Şirket Adı</span>
                </div>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Şirket adınızı girin"
                className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-sm"
              />
            </div>

            {/* Company Info Textarea */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 text-xs font-medium">
                <div className="flex items-center space-x-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Şirket Açıklaması</span>
                </div>
              </label>
              <div className="relative">
                <textarea
                  value={companyInfo}
                  onChange={(e) => setCompanyInfo(e.target.value)}
                  placeholder="Kısa bir açıklama..."
                  className="w-full h-20 px-3 py-2.5 bg-slate-800/80 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 resize-none text-xs leading-relaxed"
                  maxLength={300}
                />
                <div className="absolute bottom-2 right-2 text-slate-400 text-xs bg-slate-800/80 px-1.5 py-0.5 rounded text-xs">
                  {companyInfo.length}/300
                </div>
              </div>
            </div>

            {!isValid && (
              <div className="flex items-center space-x-1.5 text-red-400 text-xs">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Lütfen tüm alanları doldurun</span>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="px-6 pb-6">
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 ${
              isValid
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-slate-700 cursor-not-allowed opacity-50'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}