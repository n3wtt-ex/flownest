import React, { useState, useEffect } from 'react';
import { OnboardingCard } from './OnboardingCard';

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

  const handleSave = () => {
    if (isValid) {
      onSave({ targetCustomers: parseInt(targetCustomers, 10) });
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
      <div className="space-y-3">
        <div>
          <input
            type="number"
            value={targetCustomers}
            onChange={(e) => setTargetCustomers(e.target.value)}
            placeholder="Müşteri sayısını girin"
            className="w-full px-3 py-2 bg-blue-800/50 border border-blue-600/50 rounded-lg text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
        </div>
        {!isValid && targetCustomers !== '' && (
          <p className="text-red-300 text-xs">Lütfen geçerli bir sayı girin</p>
        )}
      </div>
    </OnboardingCard>
  );
}