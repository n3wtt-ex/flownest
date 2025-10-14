import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MultiStepForm from './multistep_form_fixed';

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
  workspaceId?: string;
}

export function OnboardingFlow({ onComplete, workspaceId }: OnboardingFlowProps) {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});

  // Handle completion from the multistep form
  const handleComplete = (data: OnboardingData) => {
    onComplete(data);
  };

  console.log('=== OnboardingFlow Rendering ===');
  console.log('OnboardingFlow workspaceId prop:', workspaceId);

  return (
    <div className="w-full h-[618px] flex items-center justify-center">
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full max-w-4xl h-full">
          <MultiStepForm onComplete={handleComplete} workspaceId={workspaceId} />
        </div>
      </div>
    </div>
  );
}