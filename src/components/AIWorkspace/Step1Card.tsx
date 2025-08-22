import React, { useState, useEffect } from 'react';
import { OnboardingCard } from './OnboardingCard';
import { supabase } from '../../lib/supabase';

interface Step1CardProps {
  onSave: (data: { targetCustomers: number }) => void;
  initialData: { targetCustomers?: number };
}

export function Step1Card({ onSave, initialData }: Step1CardProps) {
  const [targetCustomers, setTargetCustomers] = useState<string>(
    initialData.targetCustomers?.toString() || ''
  );
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setIsValid(targetCustomers !== '' && !isNaN(Number(targetCustomers)) && Number(targetCustomers) > 0);
  }, [targetCustomers]);

  const saveToLocalStorage = (data: { targetCustomers: number }) => {
    try {
      const existingData = JSON.parse(localStorage.getItem('company_info') || '{}');
      const updatedData = { ...existingData, target_count: data.targetCustomers };
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
      const data = { targetCustomers: parseInt(targetCustomers, 10) };
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
        
        // Tabloda kayıt olmalı (sadece update yapılacak)
        if (!existingData || existingData.length === 0) {
          console.error('No existing record found in company_info table');
          alert('Veritabanında kayıt bulunamadı. Lütfen önce diğer formları doldurun.');
          return;
        }
        
        const companyInfo = {
          target_count: data.targetCustomers
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
        
        console.log('Target customers updated successfully in Supabase');
        alert('Veriler başarıyla güncellendi!');
      } catch (error) {
        console.error('Error updating target customers in Supabase:', error);
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
      step={1}
      totalSteps={4}
      title="Kaç müşteriye ulaşmak istiyorsunuz?"
      onSave={handleSave}
      isValid={isValid}
    >
      <div className="flex flex-col h-full">
        <div className="flex-grow flex items-start justify-center pt-8">
          <div className="w-full">
            <input
              type="number"
              value={targetCustomers}
              onChange={(e) => setTargetCustomers(e.target.value)}
              placeholder="Müşteri sayısını girin"
              className="w-full px-3 py-2 bg-blue-800/50 border border-blue-600/50 rounded-lg text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
            {!isValid && targetCustomers !== '' && (
              <p className="text-red-300 text-xs mt-2 text-center">Lütfen geçerli bir sayı girin</p>
            )}
          </div>
        </div>
      </div>
    </OnboardingCard>
  );
}