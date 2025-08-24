import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Search,
  Globe,
  Instagram,
  Mail,
  Linkedin,
  Brain,
  Calendar,
  Users,
  Zap,
  MessageSquare
} from 'lucide-react';

interface HexIconProps {
  name: string;
  isSelected?: boolean;
  size?: 'small' | 'large';
  onClick?: () => void;
}

const iconMap: { [key: string]: React.ComponentType<any> } = {
  GoogleMaps: MapPin,
  Apollo: Search,
  Apify: Globe,
  Instagram: Instagram,
  Instantly: Zap,
  Lemlist: MessageSquare,
  LinkedIn: Linkedin,
  'Perplexity AI': Brain,
  PerplexityAI: Brain,
  BrightData: Globe,
  Gmail: Mail,
  CalCom: Calendar,
  CRM: Users
};

export function HexIcon({ name, isSelected = false, size = 'small', onClick }: HexIconProps) {
  const IconComponent = iconMap[name] || Search;
  const iconSize = size === 'large' ? 32 : 20;
  const hexSize = size === 'large' ? 80 : 50;

  return (
    <motion.div
      className={`relative cursor-pointer group ${onClick ? 'hover:scale-105' : ''}`}
      onClick={onClick}
      whileHover={{ scale: onClick ? 1.05 : 1 }}
      whileTap={{ scale: onClick ? 0.95 : 1 }}
      style={{ 
        zIndex: isSelected ? 25 : 15,  // Seçili olanlar en üstte
        position: 'relative' // Z-index'in çalışması için
      }}
    >
      {/* Hexagon Background */}
      <div className="relative">
        <svg
          width={hexSize}
          height={hexSize}
          viewBox="0 0 100 100"
          className="drop-shadow-lg"
        >
          {/* Glow effect for selected */}
          {isSelected && (
            <defs>
              <filter id={`glow-${name}-${Math.random()}`}>
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          )}

          {/* Hexagon shape - Opaque background to completely hide lines */}
          <polygon
            points="50,5 85,25 85,65 50,85 15,65 15,25"
            fill={isSelected ? "rgba(15, 23, 42, 0.98)" : "rgba(15, 23, 42, 0.95)"}
            stroke={isSelected ? "#06b6d4" : "#FFD44D"}
            strokeWidth={isSelected ? "3" : "2"}
            className={`transition-all duration-300 ${
              isSelected ? 'drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]' : 'drop-shadow-[0_0_10px_rgba(255,212,77,0.3)]'
            }`}
            filter={isSelected ? `url(#glow-${name}-${Math.random()})` : undefined}
          />
          
          {/* Inner shadow for depth */}
          {isSelected && (
            <polygon
              points="50,8 82,26 82,62 50,82 18,62 18,26"
              fill="none"
              stroke="rgba(6,182,212,0.3)"
              strokeWidth="1"
            />
          )}
        </svg>

        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <IconComponent
            size={iconSize}
            className={`${
              isSelected ? 'text-cyan-400' : 'text-yellow-400'
            } transition-all duration-300 ${
              isSelected ? 'filter drop-shadow-sm' : ''
            }`}
          />
        </div>

        {/* Selection Ring Animation */}
        {isSelected && (
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: [0, 0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <svg width={hexSize} height={hexSize} viewBox="0 0 100 100">
              <polygon
                points="50,5 85,25 85,65 50,85 15,65 15,25"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                opacity="0.6"
              />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Tooltip - Positioned to avoid overlap */}
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 whitespace-nowrap">
        <div className="bg-slate-800/95 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg shadow-xl border border-slate-600/50">
          <div className="text-center">
            <div className="font-medium">{name}</div>
            {isSelected && (
              <div className="text-cyan-400 text-xs mt-0.5">● Active</div>
            )}
          </div>
        </div>
        {/* Tooltip Arrow */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800/95 border-l border-t border-slate-600/50 transform rotate-45"></div>
      </div>
    </motion.div>
  );
}