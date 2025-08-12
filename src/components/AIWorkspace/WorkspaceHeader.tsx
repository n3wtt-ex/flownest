import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Check, X } from 'lucide-react';

interface WorkspaceHeaderProps {
  workspaceName: string;
  onRename?: (newName: string) => void;
  onDelete?: () => void;
}

export function WorkspaceHeader({ workspaceName, onRename, onDelete }: WorkspaceHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(workspaceName);

  const handleSaveEdit = () => {
    if (editName.trim() && editName !== workspaceName) {
      onRename?.(editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(workspaceName);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`"${workspaceName}" workspace'ini silmek istediğinizden emin misiniz?`)) {
      onDelete?.();
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Workspace Name */}
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                className="bg-slate-700 text-white px-3 py-1 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none text-lg font-semibold"
                autoFocus
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveEdit}
                className="p-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Check size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancelEdit}
                className="p-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <X size={16} />
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <h1 className="text-white text-xl font-bold">{workspaceName}</h1>
              {onRename && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <Edit2 size={16} />
                </motion.button>
              )}
              {onDelete && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </motion.button>
              )}
            </div>
          )}
        </div>
        
        <div className="text-slate-400 text-sm">
          AI Workspace • 6 Active Agents
        </div>
      </div>
    </div>
  );
}