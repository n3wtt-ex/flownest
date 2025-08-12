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

export function AgentHeader({ agents }: AgentHeaderProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-sm">
                {agent.avatar}
              </div>
              <div>
                <div className="text-white text-sm font-medium">{agent.name}</div>
                <div className="text-slate-400 text-xs">{agent.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="text-slate-400 text-sm">
          AI Workspace • 6 Active Agents
        </div>
      </div>
    </div>
  );
}