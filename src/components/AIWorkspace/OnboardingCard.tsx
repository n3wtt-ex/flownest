import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface OnboardingCardProps {
  step: number;
  totalSteps: number;
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  saveButtonText?: string;
  isValid?: boolean;
}

export function OnboardingCard({
  step,
  totalSteps,
  title,
  children,
  onSave,
  saveButtonText = 'Save',
  isValid = true
}: OnboardingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="relative w-full h-full bg-gradient-to-br from-blue-900/80 to-blue-700/80 backdrop-blur-lg rounded-2xl border border-blue-500/30 shadow-2xl overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, #60a5fa 0%, transparent 50%)`,
          backgroundSize: '100px 100px'
        }} />
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-4 left-4 flex items-center">
        <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
          <span className="text-blue-300 text-sm font-bold">{step}/{totalSteps}</span>
        </div>
        <span className="ml-2 text-blue-300 text-sm font-medium">Current Card</span>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col p-8">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
          <div className="space-y-6">
            {children}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSave}
            disabled={!isValid}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              isValid
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
            }`}
          >
            {saveButtonText}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}