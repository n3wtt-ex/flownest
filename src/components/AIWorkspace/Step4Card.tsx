import React, { useState, useEffect } from 'react';
import { OnboardingCard } from './OnboardingCard';
import { supabase } from '../../lib/supabase';

// Event type labels (from Email.tsx)
const eventLabels = {
  'demo': 'Demo',
  'e-book': 'E-book',
  'loom': 'Loom',
  'proposal': 'Proposal',
  'report': 'Report'
};

// Mock content for different event types (from Email.tsx)
const eventContents = {
  'demo': 'Join us for an exclusive product demonstration where we\'ll showcase the latest features and capabilities of our platform. This interactive session will give you hands-on experience with our tools.',
  'e-book': 'Download our comprehensive guide that covers industry best practices, expert insights, and actionable strategies to help you succeed in your business endeavors.',
  'loom': 'Watch our detailed video walkthrough that explains step-by-step processes and provides visual demonstrations of key concepts and workflows.',
  'proposal': 'Our tailored business proposal outlines strategic solutions designed specifically for your organization\'s needs and objectives.',
  'report': 'Access our latest industry report featuring market analysis, trends, and data-driven insights that will inform your business decisions.'
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
    // Update content when event type changes
    setEventContent(eventContents[selectedEvent as keyof typeof eventContents] || '');
  }, [selectedEvent]);

  const handleSave = async () => {
    const data = { eventType: selectedEvent, eventContent };
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
        event_type: data.eventType,
        event: data.eventContent,
        // Mevcut diğer alanları koru
        target_count: existingData && existingData.length > 0 ? existingData[0].target_count : 0,
        target_audience: existingData && existingData.length > 0 ? existingData[0].target_audience : '',
        name: existingData && existingData.length > 0 ? existingData[0].name : '',
        company: existingData && existingData.length > 0 ? existingData[0].company : '',
        info: existingData && existingData.length > 0 ? existingData[0].info : ''
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
      
      console.log('Event info saved successfully to Supabase');
    } catch (error) {
      console.error('Error saving event info to Supabase:', error);
    }
  };

  return (
    <OnboardingCard
      step={4}
      totalSteps={4}
      title="Bir event seçin"
      onSave={handleSave}
      isValid={isValid}
    >
      <div className="flex flex-col h-full">
        <div className="space-y-3 flex-grow">
          {/* Event Selection */}
          <div className="space-y-2">
            <label className="block text-blue-300 text-xs font-medium">
              Event Türü
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(eventLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedEvent(key)}
                  className={`p-2 rounded-lg border-2 transition-all text-left ${
                    selectedEvent === key
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-blue-600/50 bg-blue-800/50 text-blue-200 hover:border-blue-500'
                  }`}
                >
                  <div className="font-medium text-sm">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Event Content */}
          <div className="space-y-2 flex-grow">
            <label className="block text-blue-300 text-xs font-medium">
              Event Bilgileri
            </label>
            <div className="relative h-full">
              <textarea
                value={eventContent}
                onChange={(e) => setEventContent(e.target.value)}
                className="w-full h-full px-3 py-2 bg-blue-800/50 border border-blue-600/50 rounded-lg text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
                style={{ minHeight: '120px' }}
              />
              <div className="absolute bottom-2 right-2 text-blue-400 text-xs">
                {eventContent.length}/1000
              </div>
            </div>
          </div>
        </div>
      </div>
    </OnboardingCard>
  );
}