import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HexIcon } from './HexIcon';
import { ConnectionLines } from './ConnectionLines';
import { ChatBox } from './ChatBox';
import { AgentHeader } from './AgentHeader';
import { RightSidebar } from './RightSidebar';
import { Play, Sparkles } from 'lucide-react';

// ... (diğer kodlar aynı kalacak)

export function WorkspaceBoard({ workspace, onUpdateWorkspace }: WorkspaceBoardProps) {
  const [selectedTools, setSelectedTools] = useState<{ [key: string]: { tool: string; position: { x: number; y: number } } }>({});
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [connectionsValidated, setConnectionsValidated] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [boardCenter, setBoardCenter] = useState({ x: 0, y: 0 });
  const workingAreaRef = useRef<HTMLDivElement>(null);

  // Board merkezini dinamik hesapla
  useEffect(() => {
    const updateBoardCenter = () => {
      if (workingAreaRef.current) {
        const rect = workingAreaRef.current.getBoundingClientRect();
        setBoardCenter({
          x: rect.width / 2,
          y: rect.height / 2
        });
      }
    };

    updateBoardCenter();
    window.addEventListener('resize', updateBoardCenter);
    return () => window.removeEventListener('resize', updateBoardCenter);
  }, []);

  // ... (diğer fonksiyonlar aynı kalacak)

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden relative">
      {/* ... (diğer JSX elemanları aynı kalacak) */}

      {/* Right Board - Working Area */}
      <div ref={workingAreaRef} className="w-3/4 relative">
        {/* ... (diğer elemanlar aynı kalacak) */}

        {/* Working Board Content */}
        <div className="relative h-full flex items-center justify-center">
          {/* Connection Lines */}
          <div style={{ zIndex: 1 }}>
            <ConnectionLines 
              positions={Object.fromEntries(
                Object.entries(selectedTools).map(([agent, data]) => [
                  agent, data.position
                ])
              )}
              sections={Object.keys(selectedTools).map(agent => ({ id: agent, name: agent, icons: [] }))}
              selections={Object.fromEntries(
                Object.entries(selectedTools).map(([agent, data]) => [agent, data.tool])
              )}
              boardCenter={boardCenter}
            />
          </div>

          {/* ... (diğer elemanlar aynı kalacak) */}
        </div>
      </div>

      {/* ... (diğer JSX elemanları aynı kalacak) */}
    </div>
  );
}