import React, { useState, useEffect } from 'react';

const eventLabels = {
  'demo': 'Demo',
  'e-book': 'E-book',
  'loom': 'Loom',
  'proposal': 'Proposal',
  'report': 'Report'
};

const eventContents = {
  'demo': 'Join us for an exclusive product demonstration where we\'ll showcase the latest features and capabilities of our platform. This interactive session will give you hands-on experience with our tools.',
  'e-book': 'Download our comprehensive guide that covers industry best practices, expert insights, and actionable strategies to help you succeed in your business endeavors.',
  'loom': 'Watch our detailed video walkthrough that explains step-by-step processes and provides visual demonstrations of key concepts and workflows.',
  'proposal': 'Our tailored business proposal outlines strategic solutions designed specifically for your organization\'s needs and objectives.',
  'report': 'Access our latest industry report featuring market analysis, trends, and data-driven insights that will inform your business decisions.'
};

const eventIcons = {
  'demo': (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
    </svg>
  ),
  'e-book': (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
    </svg>
  ),
  'loom': (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
  ),
  'proposal': (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
    </svg>
  ),
  'report': (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  )
};

interface Step4CardProps {
  onSave: (data: { eventType: string; eventContent: string }) => void;
  initialData: { eventType?: string; eventContent?: string };
}

export function Step4Card({ onSave, initialData }: Step4CardProps) {
  const [selectedEvent, setSelectedEvent] = useState(initialData.eventType || 'demo');
  const [eventContent, setEventContent] = useState(initialData.eventContent || eventContents[selectedEvent as keyof typeof eventContents] || '');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setEventContent(eventContents[selectedEvent as keyof typeof eventContents] || '');
  }, [selectedEvent]);

  const handleSave = async () => {
    const data = { eventType: selectedEvent, eventContent };
    onSave(data);
    
    try {
      const response = await fetch('https://n8n.flownests.org/webhook/156450b8-a366-4648-8fad-eef1a1a3e5b5', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: data.eventType,
          event: data.eventContent
        }),
      });
      
      if (response.ok) {
        console.log('Event info sent to webhook successfully');
        alert('Veriler başarıyla gönderildi!');
      } else {
        throw new Error(`Webhook error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending event info to webhook:', error);
      alert('Veriler webhook\'a gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl shadow-2xl border border-blue-700/30 overflow-hidden backdrop-blur-sm">
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-end mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-xs font-medium">Step</span>
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">4</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white leading-tight">
              Bir event seçin
            </h2>
            
            <div className="bg-blue-900/40 rounded-lg p-2 border border-blue-700/50">
              <p className="text-blue-200 text-xs leading-relaxed">
                Hangi türde bir etkinlik düzenlemek istiyorsunuz?
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <div className="space-y-3">
            {/* Event Selection */}
            <div className="space-y-1.5">
              <label className="block text-blue-300 text-xs font-medium">
                Event Türü Seçin
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {Object.entries(eventLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedEvent(key)}
                    className={`flex items-center space-x-2 p-2.5 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedEvent === key
                        ? 'border-blue-500 bg-blue-500/10 text-white shadow-lg'
                        : 'border-blue-600/50 bg-blue-900/40 text-blue-200 hover:border-blue-500/50 hover:bg-blue-800/60'
                    }`}
                  >
                    <div className={`flex-shrink-0 ${selectedEvent === key ? 'text-blue-400' : 'text-blue-300'}`}>
                      {eventIcons[key as keyof typeof eventIcons]}
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium text-xs">{label}</div>
                    </div>
                    {selectedEvent === key && (
                      <div className="flex-shrink-0">
                        <div className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Event Content */}
            <div className="space-y-1.5">
              <label className="block text-blue-300 text-xs font-medium">
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Event Detayları</span>
                </div>
              </label>
              <div className="relative">
                <textarea
                  value={eventContent}
                  onChange={(e) => setEventContent(e.target.value)}
                  className="w-full h-16 px-3 py-2 bg-blue-900/40 border border-blue-600/50 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 resize-none text-xs leading-relaxed"
                  maxLength={300}
                />
                <div className="absolute bottom-1.5 right-2 text-blue-300 text-xs bg-blue-900/60 px-1 py-0.5 rounded text-xs">
                  {eventContent.length}/300
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="px-4 pb-4">
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`w-full py-2.5 rounded-xl font-semibold text-white transition-all duration-200 ${
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