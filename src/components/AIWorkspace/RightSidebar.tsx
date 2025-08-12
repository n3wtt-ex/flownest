import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RightSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onToolMention: (agent: string, tool: string) => void;
}

const agentTools: { [key: string]: string[] } = {
  Leo: ['Apollo', 'GoogleMaps', 'Apify'],
  Mike: ['Instantly', 'Lemlist'],
  Sophie: ['LinkedIn', 'PerplexityAI', 'BrightData'],
  Ash: ['CalCom'], // Eksikti, eklendi
  Clara: ['Gmail'] // Eksikti, eklendi
};

export function RightSidebar({ isOpen, onToggle, onToolMention }: RightSidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute top-0 right-0 w-72 h-full bg-slate-900 border-l border-slate-700 z-50 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-white text-lg font-semibold">Proje Elemanları</h2>
            <button
              onClick={onToggle}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {Object.entries(agentTools).map(([agent, tools]) => (
              <div
                key={agent}
                className="bg-slate-800 p-3 rounded-lg shadow border border-slate-700"
              >
                <h3 className="text-white font-medium mb-2">{agent}</h3>
                <div className="flex flex-wrap gap-2">
                  {tools.map((tool) => (
                    <button
                      key={tool}
                      onClick={() => onToolMention(agent, tool)}
                      className="px-3 py-1 bg-cyan-600 text-white text-sm rounded hover:bg-cyan-700 transition-colors"
                    >
                      {tool}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
