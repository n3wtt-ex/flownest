import React, { useState, useEffect } from 'react';
import { OnboardingCard } from './OnboardingCard';

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

  const handleSave = () => {
    if (isValid) {
      onSave({ targetAudience });
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