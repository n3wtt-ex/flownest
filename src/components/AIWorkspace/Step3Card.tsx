import React, { useState, useEffect } from 'react';
import { OnboardingCard } from './OnboardingCard';

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

  const handleSave = () => {
    if (isValid) {
      onSave({ name, companyName, companyInfo });
    }
  };

  return (
    <OnboardingCard
      step={3}
      totalSteps={4}
      title="Kendinizi tanıtın"
      onSave={handleSave}
      isValid={isValid}
    >
      <div className="space-y-4">
        {/* Name Input */}
        <div className="space-y-1.5">
          <label 
            className="block text-blue-300 text-xs font-medium"
            title="Emailler kimin adına gönderilsin"
          >
            İsim
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Adınızı girin"
            className="w-full px-3 py-2 bg-blue-800/50 border border-blue-600/50 rounded-lg text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
        </div>

        {/* Company Name Input */}
        <div className="space-y-1.5">
          <label 
            className="block text-blue-300 text-xs font-medium"
            title="Şirketinizin adı"
          >
            Şirket Adı
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Şirket adınızı girin"
            className="w-full px-3 py-2 bg-blue-800/50 border border-blue-600/50 rounded-lg text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
        </div>

        {/* Company Info Textarea */}
        <div className="space-y-1.5">
          <label className="block text-blue-300 text-xs font-medium">
            Şirketinizi ve Ürününüzü Tanıtın
          </label>
          <div className="relative">
            <textarea
              value={companyInfo}
              onChange={(e) => setCompanyInfo(e.target.value)}
              placeholder="Şirketiniz ve ürünleriniz hakkında bilgi girin..."
              className="w-full h-24 px-3 py-2 bg-blue-800/50 border border-blue-600/50 rounded-lg text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
            />
            <div className="absolute bottom-2 right-2 text-blue-400 text-xs">
              {companyInfo.length}/500
            </div>
          </div>
        </div>

        {!isValid && (
          <p className="text-red-300 text-xs">Lütfen tüm alanları doldurun</p>
        )}
      </div>
    </OnboardingCard>
  );
}