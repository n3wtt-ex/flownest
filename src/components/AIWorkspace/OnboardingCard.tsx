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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative w-full h-full bg-gradient-to-br from-blue-900/80 via-gray-900 to-blue-900/80 rounded-2xl border border-blue-700/50 shadow-2xl overflow-hidden"
      style={{ aspectRatio: '2/3' }}
    >
      {/* Modern Abstract Background */}
      <div className="absolute inset-0 opacity-25">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 20%),
            radial-gradient(circle at 90% 80%, rgba(37, 99, 235, 0.2) 0%, transparent 20%),
            radial-gradient(circle at 50% 50%, rgba(30, 64, 175, 0.15) 0%, transparent 30%)
          `,
          backgroundSize: '100% 100%'
        }} />
      </div>

      {/* Subtle Animated Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-blue-400/30 rounded-full"
            style={{
              top: `${20 + i * 20}%`,
              left: `${15 + i * 25}%`,
            }}
            animate={{
              y: [0, -12, 0],
              x: [0, 6, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2.2 + i,
              repeat: Infinity,
              delay: i * 0.3
            }}
          />
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-4 right-4">
        <div className="flex items-center space-x-1.5">
          <div className="text-blue-300 text-xs font-medium">Step</div>
          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{step}/{totalSteps}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col p-5">
        <div className="flex-1">
          <motion.h2 
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="text-xl font-bold text-white mb-4"
          >
            {title}
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.2 }}
            className="space-y-4"
          >
            {children}
          </motion.div>
        </div>

        {/* Save Button */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.2 }}
          className="mt-5 flex justify-end"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSave}
            disabled={!isValid}
            className={`px-4 py-2 rounded-md font-semibold transition-all text-sm ${
              isValid
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saveButtonText}
          </motion.button>
        </motion.div>
      </div>

      {/* Bottom Edge Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
    </motion.div>
  );
}