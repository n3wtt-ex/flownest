import React, { useState, useEffect } from 'react';

const SECTION_FIELDS = {
  "1": [
    { name: "targetCustomers", label: "Hedef Müşteri Sayısı", type: "number", required: true }
  ],
  "2": [
    { name: "targetAudience", label: "Hedef Kitle Tanımı", type: "textarea", required: true }
  ],
  "3": [
    { name: "name", label: "İsim", type: "text", required: true },
    { name: "companyName", label: "Şirket Adı", type: "text", required: true },
    { name: "companyInfo", label: "Şirket Açıklaması", type: "textarea", required: true }
  ],
  "4": [
    { name: "eventType", label: "Event Türü", type: "select", required: true },
    { name: "eventContent", label: "Event Detayları", type: "textarea", required: true }
  ]
};

const eventOptions = {
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

interface MultiStepFormProps {
  onComplete?: (data: any) => void;
}

export default function MultiStepForm({ onComplete }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [openSection, setOpenSection] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fillProgress, setFillProgress] = useState(0);
  const [mainPageInput, setMainPageInput] = useState('');

  const handleSectionClick = (stepNumber: number) => {
    // Sadece tamamlanmış veya mevcut adıma tıklanabilir
    if (stepNumber <= Math.max(...Array.from(completedSteps), currentStep)) {
      setOpenSection(openSection === stepNumber ? null : stepNumber);
    }
  };

  const handleSave = async (stepNumber: number, data: any) => {
    const newFormData = { ...formData, [stepNumber]: data };
    const newCompletedSteps = new Set([...completedSteps, stepNumber]);
    
    setFormData(newFormData);
    setCompletedSteps(newCompletedSteps);
    setCurrentStep(Math.min(stepNumber + 1, 4));
    setOpenSection(null);
    
    // Animasyon ile progress bar'ı doldur
    const newProgress = (newCompletedSteps.size / 4) * 100;
    setTimeout(() => setFillProgress(newProgress), 100);
    
    // Webhook çağrıları
    try {
      const webhooks = {
        1: 'https://n8n.flownests.org/webhook/c42236c9-e0a7-4d2e-bbdb-46940c0f91c5',
        2: 'https://n8n.flownests.org/webhook/40bb5e2c-741f-4586-8c11-7659bd1cc874',
        3: 'https://n8n.flownests.org/webhook/541cdb39-b379-4f91-a6d6-90435b58d0a0',
        4: 'https://n8n.flownests.org/webhook/156450b8-a366-4648-8fad-eef1a1a3e5b5'
      };

      const payloads = {
        1: { target_count: data.targetCustomers },
        2: { target_audience: data.targetAudience },
        3: { name: data.name, company: data.companyName, info: data.companyInfo },
        4: { event_type: data.eventType, event: data.eventContent }
      };

      if (webhooks[stepNumber as keyof typeof webhooks]) {
        const response = await fetch(webhooks[stepNumber as keyof typeof webhooks], {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloads[stepNumber as keyof typeof payloads]),
        });
        
        if (response.ok) {
          alert('Veriler başarıyla gönderildi!');
        } else {
          throw new Error(`Webhook error: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Webhook error:', error);
      alert('Veriler gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  };

  // Ana sayfadan direkt kaydetme - tüm adımlar için
  const handleMainPageSave = async () => {
    let data = {};
    let isValid = false;

    switch (currentStep) {
      case 1:
        if (mainPageInput && !isNaN(Number(mainPageInput)) && Number(mainPageInput) > 0) {
          data = { targetCustomers: mainPageInput };
          isValid = true;
        }
        break;
      case 2:
        if (mainPageInput && mainPageInput.trim().length > 0) {
          data = { targetAudience: mainPageInput };
          isValid = true;
        }
        break;
      case 3:
        if (formData[3]?.name && formData[3]?.companyName && formData[3]?.companyInfo) {
          data = formData[3];
          isValid = true;
        }
        break;
      case 4:
        if (formData[4]?.eventType && formData[4]?.eventContent) {
          data = formData[4];
          isValid = true;
        }
        break;
    }

    if (isValid) {
      await handleSave(currentStep, data);
      setMainPageInput(''); // Input'u temizle
    }
  };

  const handleStartClick = () => {
    if (completedSteps.size === 4) {
      alert('Tüm adımlar tamamlandı! Süreç başlatılıyor...');
      // Burada final işlemlerinizi yapabilirsiniz
      console.log('Final form data:', formData);
      
      // Call the onComplete callback with the collected data
      if (onComplete) {
        // Combine all form data into a single object
        const combinedData = {
          ...formData[1],
          ...formData[2],
          ...formData[3],
          ...formData[4]
        };
        onComplete(combinedData);
      }
    } else {
      handleMainPageSave();
    }
  };

  const isStepAccessible = (stepNumber: number) => {
    return stepNumber <= Math.max(...Array.from(completedSteps), currentStep);
  };

  const isStepCompleted = (stepNumber: number) => {
    return completedSteps.has(stepNumber);
  };

  const stepTitles = {
    1: "Kaç müşteriye ulaşmak istiyorsunuz?",
    2: "Hedef kitlenizi tanımlayın",
    3: "Kendinizi tanıtın", 
    4: "Bir event seçin"
  };

  const stepDescriptions = {
    1: "Hedef müşteri sayınızı belirleyin",
    2: "Hedef kitlenizi detaylı olarak açıklayın",
    3: "Kişisel ve şirket bilgilerinizi girin",
    4: "Hangi türde bir etkinlik düzenlemek istiyorsunuz?"
  };

  const isMainInputValid = mainPageInput && !isNaN(Number(mainPageInput)) && Number(mainPageInput) > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8 w-full">
      {/* Progress Bar - Exactly like the image */}
      <div className="w-full max-w-2xl mb-8 sm:mb-16">
        <div className="flex items-center justify-center">
          {[1, 2, 3, 4].map((step, index) => (
            <React.Fragment key={step}>
              {/* Node */}
              <button
                onClick={() => handleSectionClick(step)}
                disabled={!isStepAccessible(step)}
                className={`w-4 h-4 rounded-full transition-all duration-300 focus:outline-none ${
                  isStepCompleted(step) || (isStepAccessible(step) && currentStep >= step)
                    ? 'bg-teal-500 hover:bg-teal-600'
                    : 'bg-gray-300'
                } ${isStepAccessible(step) ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              />
              
              {/* Connection Line */}
              {index < 3 && (
                <div className="w-16 h-0.5 mx-2">
                  <div 
                    className={`h-full transition-all duration-700 ${
                      isStepCompleted(step) 
                        ? 'bg-teal-500' 
                        : 'bg-gray-300'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {!openSection ? (
        <div className="text-center max-w-2xl w-full flex flex-col items-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            {stepTitles[currentStep as keyof typeof stepTitles] || "Süreç Tamamlandı"}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12">
            {stepDescriptions[currentStep as keyof typeof stepDescriptions] || "Tüm adımları tamamladınız"}
          </p>
          
          {/* Ana sayfa input alanları - her adım için */}
          <div className="w-full mb-8">
            {currentStep <= 4 && !completedSteps.has(currentStep) && (
              <div className="mb-8">
                {/* 1. Adım - Sayı Input */}
                {currentStep === 1 && (
                  <div className="flex items-center max-w-lg mx-auto">
                    <div className="flex-1">
                      <input
                        type="number"
                        value={mainPageInput}
                        onChange={(e) => setMainPageInput(e.target.value)}
                        placeholder="Örn: 100"
                        className="w-full px-6 py-4 text-lg border-2 border-teal-500 rounded-l-full focus:outline-none focus:border-teal-600 transition-colors duration-200"
                      />
                    </div>
                    <button
                      onClick={handleStartClick}
                      disabled={!isMainInputValid}
                      className={`px-8 py-4 text-lg font-semibold text-white rounded-r-full transition-all duration-200 ${
                        isMainInputValid
                          ? 'bg-teal-600 hover:bg-teal-700'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Başla →
                    </button>
                  </div>
                )}

                {/* 2. Adım - Textarea */}
                {currentStep === 2 && (
                  <div className="max-w-2xl mx-auto space-y-6">
                    <textarea
                      value={mainPageInput}
                      onChange={(e) => setMainPageInput(e.target.value)}
                      placeholder="Hedef kitlenizi detaylı olarak tanımlayın..."
                      className="w-full h-32 px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors duration-200 resize-none"
                      maxLength={1000}
                    />
                    <div className="text-center">
                      <button
                        onClick={handleStartClick}
                        disabled={!mainPageInput || mainPageInput.trim().length === 0}
                        className={`px-12 py-4 text-lg font-semibold text-white rounded-full transition-all duration-200 ${
                          mainPageInput && mainPageInput.trim().length > 0
                            ? 'bg-teal-600 hover:bg-teal-700 transform hover:scale-105'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Devam Et →
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Adım - Çoklu Input */}
                {currentStep === 3 && (
                  <div className="max-w-xl mx-auto space-y-6">
                    <input
                      type="text"
                      value={formData[3]?.name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, 3: { ...prev[3], name: e.target.value } }))}
                      placeholder="Adınızı girin"
                      className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors duration-200"
                    />
                    
                    <input
                      type="text"
                      value={formData[3]?.companyName || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, 3: { ...prev[3], companyName: e.target.value } }))}
                      placeholder="Şirket adınızı girin"
                      className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors duration-200"
                    />
                    
                    <textarea
                      value={formData[3]?.companyInfo || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, 3: { ...prev[3], companyInfo: e.target.value } }))}
                      placeholder="Şirketiniz hakkında kısa bir açıklama..."
                      className="w-full h-24 px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors duration-200 resize-none"
                      maxLength={300}
                    />
                    
                    <div className="text-center">
                      <button
                        onClick={handleStartClick}
                        disabled={!formData[3]?.name || !formData[3]?.companyName || !formData[3]?.companyInfo}
                        className={`px-12 py-4 text-lg font-semibold text-white rounded-full transition-all duration-200 ${
                          formData[3]?.name && formData[3]?.companyName && formData[3]?.companyInfo
                            ? 'bg-teal-600 hover:bg-teal-700 transform hover:scale-105'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Devam Et →
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. Adım - Event Selection */}
                {currentStep === 4 && (
                  <div className="max-w-4xl mx-auto space-y-6">
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {Object.entries(eventOptions).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            4: { 
                              ...prev[4], 
                              eventType: key, 
                              eventContent: eventContents[key as keyof typeof eventContents] || '' 
                            } 
                          }))}
                          className={`px-4 py-3 text-base font-medium rounded-full border-2 transition-all duration-200 ${
                            formData[4]?.eventType === key
                              ? 'bg-teal-600 text-white border-teal-600'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-teal-500'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="max-w-2xl mx-auto">
                      <textarea
                        value={formData[4]?.eventContent || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, 4: { ...prev[4], eventContent: e.target.value } }))}
                        placeholder="Event detaylarını açıklayın..."
                        className="w-full h-24 px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors duration-200 resize-none"
                        maxLength={500}
                      />
                    </div>
                    
                    <div className="text-center">
                      <button
                        onClick={handleStartClick}
                        disabled={!formData[4]?.eventType || !formData[4]?.eventContent}
                        className={`px-12 py-4 text-lg font-semibold text-white rounded-full transition-all duration-200 ${
                          formData[4]?.eventType && formData[4]?.eventContent
                            ? 'bg-teal-600 hover:bg-teal-700 transform hover:scale-105'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Tamamla →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-8">
            {completedSteps.size === 4 ? (
              <button
                onClick={handleStartClick}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Başlat →
              </button>
            ) : (
              completedSteps.has(currentStep) && currentStep < 4 && (
                <button
                  onClick={() => setOpenSection(currentStep)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Düzenle
                </button>
              )
            )}
          </div>
        </div>
      ) : (
        <StepFormContent
          stepNumber={openSection}
          initialData={formData[openSection] || {}}
          onSave={(data) => handleSave(openSection as number, data)}
          onClose={() => setOpenSection(null)}
          stepTitle={stepTitles[openSection as keyof typeof stepTitles]}
          stepDescription={stepDescriptions[openSection as keyof typeof stepDescriptions]}
          completedSteps={completedSteps}
          currentStep={currentStep}
          handleSectionClick={handleSectionClick}
        />
      )}
    </div>
  );
}

function StepFormContent({ stepNumber, initialData, onSave, onClose, stepTitle, stepDescription, completedSteps, currentStep, handleSectionClick }: any) {
  const [formState, setFormState] = useState(initialData);

  useEffect(() => {
    setFormState(initialData);
  }, [initialData]);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormState(prev => ({ ...prev, [fieldName]: value }));
  };

  const validateForm = () => {
    const fields = SECTION_FIELDS[stepNumber as keyof typeof SECTION_FIELDS];
    return fields.every(field => {
      const value = formState[field.name];
      if (field.required) {
        if (field.type === 'number') {
          return value && !isNaN(Number(value)) && Number(value) > 0;
        }
        return value && value.toString().trim().length > 0;
      }
      return true;
    });
  };

  const isValid = validateForm();

  const handleSave = () => {
    if (isValid) {
      onSave(formState);
    }
  };

  // Step 4 için event content otomatik doldurma
  useEffect(() => {
    if (stepNumber === 4 && formState.eventType && !formState.eventContent) {
      setFormState(prev => ({
        ...prev,
        eventContent: eventContents[formState.eventType as keyof typeof eventContents] || ''
      }));
    }
  }, [formState.eventType, stepNumber]);

  const renderFormFields = () => {
    switch (stepNumber) {
      case 1:
        return (
          <div className="flex items-center max-w-lg mx-auto">
            <div className="flex-1">
              <input
                type="number"
                value={formState.targetCustomers || ''}
                onChange={(e) => handleInputChange('targetCustomers', e.target.value)}
                placeholder="Örn: 100"
                className="w-full px-6 py-4 text-lg border-2 border-teal-500 rounded-l-full focus:outline-none focus:border-teal-600 transition-colors duration-200"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={!isValid}
              className={`px-8 py-4 text-lg font-semibold text-white rounded-r-full transition-all duration-200 ${
                isValid
                  ? 'bg-teal-600 hover:bg-teal-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Sonraki →
            </button>
          </div>
        );

      case 2:
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <textarea
              value={formState.targetAudience || ''}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              placeholder="Hedef kitlenizi detaylı olarak tanımlayın..."
              className="w-full h-32 px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors duration-200 resize-none"
              maxLength={1000}
            />
            <div className="text-center">
              <button
                onClick={handleSave}
                disabled={!isValid}
                className={`px-12 py-4 text-lg font-semibold text-white rounded-full transition-all duration-200 ${
                  isValid
                    ? 'bg-teal-600 hover:bg-teal-700 transform hover:scale-105'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Kaydet
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="max-w-xl mx-auto space-y-6">
            <input
              type="text"
              value={formState.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Adınızı girin"
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors duration-200"
            />
            
            <input
              type="text"
              value={formState.companyName || ''}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              placeholder="Şirket adınızı girin"
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors duration-200"
            />
            
            <textarea
              value={formState.companyInfo || ''}
              onChange={(e) => handleInputChange('companyInfo', e.target.value)}
              placeholder="Şirketiniz hakkında kısa bir açıklama..."
              className="w-full h-24 px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors duration-200 resize-none"
              maxLength={300}
            />
            
            <div className="text-center">
              <button
                onClick={handleSave}
                disabled={!isValid}
                className={`px-12 py-4 text-lg font-semibold text-white rounded-full transition-all duration-200 ${
                  isValid
                    ? 'bg-teal-600 hover:bg-teal-700 transform hover:scale-105'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Kaydet
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Event Type Selection */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.entries(eventOptions).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleInputChange('eventType', key)}
                  className={`px-6 py-3 text-lg font-medium rounded-full border-2 transition-all duration-200 ${
                    formState.eventType === key
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-teal-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <textarea
              value={formState.eventContent || ''}
              onChange={(e) => handleInputChange('eventContent', e.target.value)}
              placeholder="Event detaylarını açıklayın..."
              className="w-full h-32 px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors duration-200 resize-none"
              maxLength={500}
            />
            
            <div className="text-center">
              <button
                onClick={handleSave}
                disabled={!isValid}
                className={`px-12 py-4 text-lg font-semibold text-white rounded-full transition-all duration-200 ${
                  isValid
                    ? 'bg-teal-600 hover:bg-teal-700 transform hover:scale-105'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Tamamla
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white w-full flex flex-col">
      {/* Close button */}
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-10">
        <button
          onClick={onClose}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col items-center justify-center flex-grow pt-16 sm:pt-20 pb-8 sm:pb-16 px-4 sm:px-6">
        {/* Progress Bar */}
        <div className="w-full max-w-lg mx-auto mb-8 sm:mb-16">
          <div className="flex items-center justify-center">
            {[1, 2, 3, 4].map((step, index) => (
              <React.Fragment key={step}>
                {/* Node */}
                <button
                  onClick={() => handleSectionClick(step)}
                  disabled={!(step <= Math.max(...Array.from(completedSteps), currentStep))}
                  className={`w-4 h-4 rounded-full transition-all duration-300 focus:outline-none ${
                    completedSteps.has(step) || (step <= Math.max(...Array.from(completedSteps), currentStep) && currentStep >= step)
                      ? 'bg-teal-500 hover:bg-teal-600'
                      : 'bg-gray-300'
                  } ${step <= Math.max(...Array.from(completedSteps), currentStep) ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                />
                
                {/* Connection Line */}
                {index < 3 && (
                  <div className="w-12 h-0.5 mx-2">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        completedSteps.has(step) 
                          ? 'bg-teal-500' 
                          : 'bg-gray-300'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8 sm:mb-12 w-full max-w-2xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
            {stepTitle}
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            {stepDescription}
          </p>
        </div>

        {/* Form Content */}
        <div className="w-full max-w-2xl">
          {renderFormFields()}
        </div>
      </div>
    </div>
  );
}
