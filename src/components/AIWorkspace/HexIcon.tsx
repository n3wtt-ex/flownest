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
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
          )}
          
          {/* Hexagon shape - All borders now yellow */}
          <polygon
            points="50,5 85,25 85,65 50,85 15,65 15,25"
            fill="rgba(15, 23, 42, 0.8)"
            stroke="#FFD44D"
            strokeWidth="3"
            className={`transition-all duration-300 ${
              isSelected ? 'drop-shadow-[0_0_15px_rgba(255,212,77,0.6)]' : ''
            }`}
            filter={isSelected ? "url(#glow)" : undefined}
          />
        </svg>
        
        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <IconComponent 
            size={iconSize} 
            className={`${isSelected ? 'text-yellow-400' : 'text-yellow-300'} transition-colors duration-300`}
          />
        </div>
      </div>
      
      {/* Tooltip */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {name}
        </div>
      </div>
    </motion.div>
  );
}