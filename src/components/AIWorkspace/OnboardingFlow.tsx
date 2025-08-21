import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Step1Card } from './Step1Card';
import { Step2Card } from './Step2Card';
import { Step3Card } from './Step3Card';
import { Step4Card } from './Step4Card';

interface OnboardingData {
  targetCustomers?: number;
  targetAudience?: string;
  name?: string;
  companyName?: string;
  companyInfo?: string;
  eventType?: string;
  eventContent?: string;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

const TOTAL_STEPS = 4;

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [direction, setDirection] = useState(0);

  const handleSave = (data: Partial<OnboardingData>) => {
    const updatedData = { ...onboardingData, ...data };
    setOnboardingData(updatedData);
    
    if (currentStep < TOTAL_STEPS) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(updatedData);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Card onSave={handleSave} initialData={onboardingData} />;
      case 2:
        return <Step2Card onSave={handleSave} initialData={onboardingData} />;
      case 3:
        return <Step3Card onSave={handleSave} initialData={onboardingData} />;
      case 4:
        return <Step4Card onSave={handleSave} initialData={onboardingData} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-[618px] flex items-center justify-center">
      <div className="w-full max-w-3xl h-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={{
              enter: (direction: number) => ({
                x: direction > 0 ? 1000 : -1000,
                opacity: 0,
                rotateY: direction > 0 ? -120 : 120,
              }),
              center: {
                zIndex: 1,
                x: 0,
                opacity: 1,
                rotateY: 0,
              },
              exit: (direction: number) => ({
                zIndex: 0,
                x: direction < 0 ? 1000 : -1000,
                opacity: 0,
                rotateY: direction < 0 ? -120 : 120,
              })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
              rotateY: { duration: 0.6, ease: "easeInOut" }
            }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}