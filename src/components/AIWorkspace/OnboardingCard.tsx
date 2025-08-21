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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden"
      style={{ aspectRatio: '2/3' }}
    >
      {/* Modern Abstract Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.3) 0%, transparent 20%),
            radial-gradient(circle at 90% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 20%),
            radial-gradient(circle at 50% 50%, rgba(55, 48, 163, 0.2) 0%, transparent 30%)
          `,
          backgroundSize: '100% 100%'
        }} />
      </div>

      {/* Subtle Animated Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-indigo-400/20 rounded-full"
            style={{
              top: `${20 + i * 20}%`,
              left: `${15 + i * 25}%`,
            }}
            animate={{
              y: [0, -15, 0],
              x: [0, 8, 0],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 2.5 + i,
              repeat: Infinity,
              delay: i * 0.4
            }}
          />
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-5 right-5">
        <div className="flex items-center space-x-2">
          <div className="text-gray-400 text-sm font-medium">Step</div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{step}/{totalSteps}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col p-6">
        <div className="flex-1">
          <motion.h2 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="text-2xl font-bold text-white mb-5"
          >
            {title}
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.2 }}
            className="space-y-5"
          >
            {children}
          </motion.div>
        </div>

        {/* Save Button */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.2 }}
          className="mt-6 flex justify-end"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSave}
            disabled={!isValid}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all text-sm ${
              isValid
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saveButtonText}
          </motion.button>
        </motion.div>
      </div>

      {/* Bottom Edge Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
    </motion.div>
  );
}