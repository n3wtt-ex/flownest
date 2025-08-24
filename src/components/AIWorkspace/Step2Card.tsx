import React, { useState, useEffect } from 'react';

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

  const handleSave = async () => {
    if (isValid) {
      const data = { targetAudience };
      onSave(data);
      
      try {
        const response = await fetch('https://n8n.flownests.org/webhook/40bb5e2c-741f-4586-8c11-7659bd1cc874', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            target_audience: data.targetAudience
          }),
        });
        
        if (response.ok) {
          console.log('Target audience sent to webhook successfully');
          alert('Veriler başarıyla gönderildi!');
        } else {
          throw new Error(`Webhook error: ${response.status}`);
        }
      } catch (error) {
        console.error('Error sending target audience to webhook:', error);
        alert('Veriler webhook\'a gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl shadow-2xl border border-blue-700/30 overflow-hidden backdrop-blur-sm">
        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center justify-end mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-sm font-medium">Step</span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">2</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white leading-tight">
              Hedef kitlenizi tanıtın
            </h2>
            
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
              <p className="text-slate-300 text-sm leading-relaxed">
                Hedef kitlenizi detaylı olarak tanımlayın...
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-6">
          <div className="space-y-4">
            <div className="text-slate-400 text-sm">
              Lütfen hedef kitle tanımınızı girin
            </div>
            
            <div className="relative">
              <textarea
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Örneğin: 25-45 yaş arası, teknoloji sektöründe çalışan, dijital çözümlere ilgi duyan profesyoneller..."
                className="w-full h-32 px-4 py-4 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 resize-none text-sm leading-relaxed"
                maxLength={1000}
              />
              <div className="absolute bottom-3 right-3 text-slate-400 text-xs bg-slate-800/80 px-2 py-1 rounded">
                {targetAudience.length}/1000
              </div>
            </div>
            
            {!isValid && (
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Lütfen hedef kitle tanımınızı girin</span>
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