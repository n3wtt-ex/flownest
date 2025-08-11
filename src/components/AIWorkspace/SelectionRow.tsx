import React from 'react';
import { motion } from 'framer-motion';
import { HexIcon } from './HexIcon';

interface Section {
  id: string;
  name: string;
  icons: string[];
}

interface SelectionRowProps {
  section: Section;
  selectedIcon?: string;
  onIconSelect: (iconName: string) => void;
}

export function SelectionRow({ section, selectedIcon, onIconSelect }: SelectionRowProps) {
  return (
    <div className="flex items-center space-x-3">
      <div className="w-24 text-sm text-slate-400 font-medium">
        {section.name}
      </div>
      
      <div className="flex space-x-2" role="list">
        {section.icons.map((iconName, index) => (
          <motion.div
            key={iconName}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            role="listitem"
          >
            <HexIcon
              name={iconName}
              isSelected={selectedIcon === iconName}
              size="small"
              onClick={() => onIconSelect(iconName)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}