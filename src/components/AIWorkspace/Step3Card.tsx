import React, { useState, useEffect } from 'react';
import { OnboardingCard } from './OnboardingCard';
import { supabase } from '../../lib/supabase';

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

  const saveToLocalStorage = (data: { name: string; companyName: string; companyInfo: string }) => {
    try {
      const existingData = JSON.parse(localStorage.getItem('company_info') || '{}');
      const updatedData = { 
        ...existingData, 
        name: data.name,
        company: data.companyName,
        info: data.companyInfo
      };
      localStorage.setItem('company_info', JSON.stringify(updatedData));
      console.log('Data saved to localStorage:', updatedData);
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const data = JSON.parse(localStorage.getItem('company_info') || '{}');
      console.log('Data loaded from localStorage:', data);
      return data;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return {};
    }
  };

  const handleSave = async () => {
    if (isValid) {
      const data = { name, companyName, companyInfo };
      onSave(data);
      
      try {
        // Önce mevcut veri olup olmadığını kontrol et
        const { data: existingData, error: fetchError } = await supabase
          .from('company_info')
          .select('*')
          .limit(1);
        
        if (fetchError) {
          throw fetchError;
        }
        
        // Sadece UPDATE yapılacak, kayıt olmalı
        if (!existingData || existingData.length === 0) {
          console.error('No existing record found in company_info table');
          alert('Veritabanında kayıt bulunamadı. Lütfen önce diğer formları doldurun.');
          return;
        }
        
        const companyInfoData = {
          name: data.name,
          company: data.companyName,
          info: data.companyInfo
        };
        
        // Sadece update işlemi yapılacak
        const id = existingData[0].id;
        const { error: updateError } = await supabase
          .from('company_info')
          .update(companyInfoData)
          .eq('id', id);
        
        if (updateError) {
          throw updateError;
        }
        
        console.log('Company info updated successfully in Supabase');
        alert('Veriler başarıyla güncellendi!');
      } catch (error) {
        console.error('Error updating company info in Supabase:', error);
        // Fallback olarak localStorage kullan
        const localStorageSuccess = saveToLocalStorage(data);
        if (localStorageSuccess) {
          alert('Veriler yerel olarak kaydedildi. (Supabase erişim hatası)');
        } else {
          alert('Veriler kaydedilemedi. Lütfen daha sonra tekrar deneyin.');
        }
      }
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
      <div className="flex flex-col h-full">
        <div className="space-y-3 flex-grow">
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
          <div className="space-y-1.5 flex-grow">
            <label className="block text-blue-300 text-xs font-medium">
              Şirketinizi ve Ürününüzü Tanıtın
            </label>
            <div className="relative h-full">
              <textarea
                value={companyInfo}
                onChange={(e) => setCompanyInfo(e.target.value)}
                placeholder="Şirketiniz ve ürünleriniz hakkında bilgi girin..."
                className="w-full h-full px-3 py-2 bg-blue-800/50 border border-blue-600/50 rounded-lg text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
              />
              <div className="absolute bottom-2 right-2 text-blue-400 text-xs">
                {companyInfo.length}/500
              </div>
            </div>
          </div>
        </div>

        {!isValid && (
          <div className="flex-shrink-0 mt-2">
            <p className="text-red-300 text-xs text-center">Lütfen tüm alanları doldurun</p>
          </div>
        )}
      </div>
    </OnboardingCard>
  );
}