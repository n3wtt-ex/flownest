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
        
        const companyInfo = {
          target_audience: data.targetAudience
        };
        
        // Sadece update işlemi yapılacak
        const id = existingData[0].id;
        const { error: updateError } = await supabase
          .from('company_info')
          .update(companyInfo)
          .eq('id', id);
        
        if (updateError) {
          throw updateError;
        }
        
        console.log('Target audience updated successfully in Supabase');
        alert('Veriler başarıyla güncellendi!');
      } catch (error) {
        console.error('Error updating target audience in Supabase:', error);
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