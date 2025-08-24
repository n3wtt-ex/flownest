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

  const handleSave = async () => {
    if (isValid) {
      const data = { targetCustomers: parseInt(targetCustomers, 10) };
      onSave(data);
      
      try {
        const response = await fetch('https://n8n.flownests.org/webhook/c42236c9-e0a7-4d2e-bbdb-46940c0f91c5', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            target_count: data.targetCustomers
          }),
        });
        
        if (response.ok) {
          console.log('Target customers sent to webhook successfully');
          alert('Veriler başarıyla gönderildi!');
        } else {
          throw new Error(`Webhook error: ${response.status}`);
        }
      } catch (error) {
        console.error('Error sending target customers to webhook:', error);
        alert('Veriler webhook\'a gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm">
        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center justify-end mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-sm font-medium">Step</span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">1</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white leading-tight">
              Kaç müşteriye ulaşmak istiyorsunuz?
            </h2>
            
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
              <p className="text-slate-300 text-sm leading-relaxed">
                Hedef müşteri sayınızı detaylı olarak belirleyin...
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-6">
          <div className="space-y-4">
            <div className="text-slate-400 text-sm">
              Lütfen hedef müşteri sayınızı girin
            </div>
            
            <div className="relative">
              <input
                type="number"
                value={targetCustomers}
                onChange={(e) => setTargetCustomers(e.target.value)}
                placeholder="Örn: 1000"
                className="w-full px-4 py-4 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-lg font-medium"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="text-slate-400 text-sm">müşteri</div>
              </div>
            </div>
            
            {!isValid && targetCustomers !== '' && (
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Lütfen geçerli bir sayı girin</span>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="px-8 pb-8">
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 ${
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