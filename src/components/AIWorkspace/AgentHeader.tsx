import React from 'react';
import { motion } from 'framer-motion';

interface Agent {
  name: string;
  role: string;
  avatar: string;
}

interface AgentHeaderProps {
  agents: Agent[];
}

// Enhanced Sophie avatar
const SophieAvatar = () => (
  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 flex items-center justify-center text-white text-lg relative overflow-hidden border-2 border-white/20">
    <div className="absolute inset-0 bg-gradient-to-br from-rose-300/40 to-transparent"></div>
    {/* Email/Pen icon for personalization specialist */}
    <svg className="w-6 h-6 relative z-10" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
    </svg>
    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full border-2 border-white flex items-center justify-center">
      <span className="text-xs">✍️</span>
    </div>
  </div>
);

export function AgentHeader({ agents }: AgentHeaderProps) {
  return (
    <div className="border-b border-slate-700/50 p-4">
      <div className="flex justify-center space-x-8">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center cursor-pointer group hover:scale-105 transition-transform duration-200"
          >
            {/* Avatar */}
            {agent.name === 'Sophie' ? (
              <div className="mb-2 group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-shadow duration-200">
                <SophieAvatar />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white text-lg mb-2 group-hover:shadow-lg group-hover:shadow-cyan-500/25 transition-shadow duration-200">
                {agent.avatar}
              </div>
            )}
            
            {/* Name and Role */}
            <div className="text-center">
              <div className="text-sm font-bold text-white">{agent.name}</div>
              <div className="text-xs text-slate-400 max-w-20 leading-tight">{agent.role}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}