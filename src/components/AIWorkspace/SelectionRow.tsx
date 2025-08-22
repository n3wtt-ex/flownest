import React from 'react';
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
        {section.icons.map((iconName) => (
          <div key={iconName} role="listitem">
            <HexIcon
              name={iconName}
              isSelected={selectedIcon === iconName}
              size="small"
              onClick={() => onIconSelect(iconName)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}