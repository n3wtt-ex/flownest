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
        
        const companyInfo = {
          target_count: data.targetCustomers,
          // Mevcut diğer alanları koru
          target_audience: existingData && existingData.length > 0 ? existingData[0].target_audience : '',
          name: existingData && existingData.length > 0 ? existingData[0].name : '',
          company: existingData && existingData.length > 0 ? existingData[0].company : '',
          info: existingData && existingData.length > 0 ? existingData[0].info : '',
          event_type: existingData && existingData.length > 0 ? existingData[0].event_type : '',
          event: existingData && existingData.length > 0 ? existingData[0].event : ''
        };
        
        let result;
        if (existingData && existingData.length > 0) {
          // Veri varsa güncelle
          const id = existingData[0].id;
          result = await supabase
            .from('company_info')
            .update(companyInfo)
            .eq('id', id);
        } else {
          // Veri yoksa yeni oluştur
          result = await supabase
            .from('company_info')
            .insert([companyInfo]);
        }
        
        if (result.error) {
          throw result.error;
        }
        
        console.log('Target customers saved successfully to Supabase');
      } catch (error) {
        console.error('Error saving target customers to Supabase:', error);
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