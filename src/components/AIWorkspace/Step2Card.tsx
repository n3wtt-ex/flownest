import React, { useState, useEffect } from 'react';
import { OnboardingCard } from './OnboardingCard';
import { supabase } from '../../lib/supabase';

interface Step2CardProps {
  onSave: (data: { targetAudience: string }) => void;
  initialData: { targetAudience?: string };
}

export function Step2Card({ onSave, initialData }: Step2CardProps) {
  const [targetAudience, setTargetAudience] = useState(initialData.targetAudience || '');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setIsValid(targetAudience.length > 0);
  }, [targetAudience]);

  const saveToLocalStorage = (data: { targetAudience: string }) => {
    try {
      const existingData = JSON.parse(localStorage.getItem('company_info') || '{}');
      const updatedData = { ...existingData, target_audience: data.targetAudience };
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
      const data = { targetAudience };
      onSave(data);
      
      try {
        // Önce mevcut veri olup olmadığını kontrol et
        console.log('Attempting to fetch existing data from Supabase...');
        const { data: existingData, error: fetchError } = await supabase
          .from('company_info')
          .select('*')
          .limit(1);
        
        if (fetchError) {
          console.error('Error fetching existing data from Supabase:', fetchError);
          console.error('Error details:', {
            message: fetchError.message,
            code: fetchError.code,
            hint: fetchError.hint
          });
          
          // Supabase hatası durumunda localStorage kullan
          console.log('Falling back to localStorage...');
          const localStorageSuccess = saveToLocalStorage(data);
          if (localStorageSuccess) {
            alert('Veriler yerel olarak kaydedildi. (Supabase erişim hatası)');
          } else {
            alert('Veriler kaydedilemedi. Lütfen daha sonra tekrar deneyin.');
          }
          return;
        }
        
        console.log('Existing data fetched successfully:', existingData);
        
        const companyInfo = {
          target_audience: data.targetAudience,
          // Mevcut diğer alanları koru
          target_count: existingData && existingData.length > 0 ? existingData[0].target_count : 0,
          name: existingData && existingData.length > 0 ? existingData[0].name : '',
          company: existingData && existingData.length > 0 ? existingData[0].company : '',
          info: existingData && existingData.length > 0 ? existingData[0].info : '',
          event_type: existingData && existingData.length > 0 ? existingData[0].event_type : '',
          event: existingData && existingData.length > 0 ? existingData[0].event : ''
        };
        
        console.log('Attempting to save data to Supabase:', companyInfo);
        let result;
        if (existingData && existingData.length > 0) {
          // Veri varsa güncelle
          const id = existingData[0].id;
          console.log('Updating existing record with id:', id);
          result = await supabase
            .from('company_info')
            .update(companyInfo)
            .eq('id', id);
        } else {
          // Veri yoksa yeni oluştur
          console.log('Inserting new record');
          result = await supabase
            .from('company_info')
            .insert([companyInfo]);
        }
        
        if (result.error) {
          console.error('Error saving to Supabase:', result.error);
          console.error('Error details:', {
            message: result.error.message,
            code: result.error.code,
            details: result.error.details,
            hint: result.error.hint
          });
          
          // Supabase hatası durumunda localStorage kullan
          console.log('Falling back to localStorage...');
          const localStorageSuccess = saveToLocalStorage(data);
          if (localStorageSuccess) {
            alert('Veriler yerel olarak kaydedildi. (Supabase erişim hatası)');
          } else {
            alert('Veriler kaydedilemedi. Lütfen daha sonra tekrar deneyin.');
          }
          return;
        }
        
        console.log('Target audience saved successfully to Supabase');
        console.log('Save result:', result);
        // Başarılı durumda kullanıcıya bilgi ver
        alert('Veriler başarıyla kaydedildi!');
      } catch (error) {
        console.error('Error saving target audience to Supabase:', error);
        // Hata durumunda localStorage kullan
        console.log('Falling back to localStorage...');
        const localStorageSuccess = saveToLocalStorage(data);
        if (localStorageSuccess) {
          alert('Veriler yerel olarak kaydedildi. (Beklenmeyen hata)');
        } else {
          alert('Veriler kaydedilemedi. Lütfen daha sonra tekrar deneyin.');
        }
      }
    }
  };

  return (
    <OnboardingCard
      step={2}
      totalSteps={4}
      title="Hedef kitlenizi tanıtın"
      onSave={handleSave}
      isValid={isValid}
    >
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          <div className="relative h-full">
            <textarea
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="Hedef kitlenizi detaylı olarak tanımlayın..."
              className="w-full h-full px-3 py-2 bg-blue-800/50 border border-blue-600/50 rounded-lg text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
            />
            <div className="absolute bottom-2 right-2 text-blue-400 text-xs">
              {targetAudience.length}/1000
            </div>
          </div>
        </div>
        {!isValid && (
          <div className="flex-shrink-0 mt-2">
            <p className="text-red-300 text-xs text-center">Lütfen hedef kitle tanımınızı girin</p>
          </div>
        )}
      </div>
    </OnboardingCard>
  );
}