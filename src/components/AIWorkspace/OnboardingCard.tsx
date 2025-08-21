import React from 'react';
import { motion } from 'framer-motion';

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="relative w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden"
    >
      {/* Modern Geometric Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(59, 130, 246, 0.1) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(59, 130, 246, 0.1) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(59, 130, 246, 0.1) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(59, 130, 246, 0.1) 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }} />
      </div>

      {/* Subtle Glow Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-6 right-6">
        <div className="flex items-center space-x-2">
          <div className="text-slate-400 text-sm font-medium">Step</div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">{step}/{totalSteps}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col p-8">
        <div className="flex-1">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-3xl font-bold text-white mb-6"
          >
            {title}
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="space-y-6"
          >
            {children}
          </motion.div>
        </div>

        {/* Save Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-8 flex justify-end"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSave}
            disabled={!isValid}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              isValid
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:shadow-xl'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            {saveButtonText}
          </motion.button>
        </motion.div>
      </div>

      {/* Bottom Edge Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
    </motion.div>
  );
}