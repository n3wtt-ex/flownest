import React from 'react';
import MultiStepForm from '@/components/AIWorkspace/multistep_form_fixed';
import { useNavigate } from 'react-router-dom';

export default function MultiStepFormPage() {
  const navigate = useNavigate();

  const handleComplete = (data: any) => {
    console.log('Form completed with data:', data);
    // Here you would typically save the data or trigger some action
    // For now, we'll just navigate to the dashboard
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-[100] w-full h-full bg-gray-50 overflow-auto">
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <MultiStepForm onComplete={handleComplete} />
        </div>
      </div>
    </div>
  );
}