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
      <div className="space-y-6">
        {/* Name Input */}
        <div className="space-y-2">
          <label 
            className="block text-blue-300 text-sm font-medium"
            title="Emailler kimin adına gönderilsin"
          >
            İsim
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Adınızı girin"
            className="w-full px-4 py-3 bg-blue-800/50 border border-blue-600/50 rounded-lg text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Company Name Input */}
        <div className="space-y-2">
          <label 
            className="block text-blue-300 text-sm font-medium"
            title="Şirketinizin adı"
          >
            Şirket Adı
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Şirket adınızı girin"
            className="w-full px-4 py-3 bg-blue-800/50 border border-blue-600/50 rounded-lg text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Company Info Textarea */}
        <div className="space-y-2">
          <label className="block text-blue-300 text-sm font-medium">
            Şirketinizi ve Ürününüzü Tanıtın
          </label>
          <div className="relative">
            <textarea
              value={companyInfo}
              onChange={(e) => setCompanyInfo(e.target.value)}
              placeholder="Şirketiniz ve ürünleriniz hakkında bilgi girin..."
              className="w-full h-32 px-4 py-3 bg-blue-800/50 border border-blue-600/50 rounded-lg text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
            />
            <div className="absolute bottom-3 right-3 text-blue-400 text-sm">
              {companyInfo.length}/500
            </div>
          </div>
        </div>

        {!isValid && (
          <p className="text-red-300 text-sm">Lütfen tüm alanları doldurun</p>
        )}
      </div>
    </OnboardingCard>
  );
}