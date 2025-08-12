import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  Users, 
  Edit2, 
  Trash2, 
  Check, 
  X,
  Clock
} from 'lucide-react';

interface WorkspaceData {
  id: string;
  name: string;
  selections: { [key: string]: string };
  messages: any[];
  createdAt: string;
}

interface WorkspaceCardProps {
  workspace: WorkspaceData;
  onSelect: (workspace: WorkspaceData) => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

function WorkspaceCard({ workspace, onSelect, onRename, onDelete }: WorkspaceCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(workspace.name);
  const [showActions, setShowActions] = useState(false);

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editName.trim() && editName !== workspace.name) {
      onRename(workspace.id, editName.trim());
    }
    setIsEditing(false);
    setShowActions(false);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(workspace.name);
    setIsEditing(false);
    setShowActions(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`"${workspace.name}" workspace'ini silmek istediğinizden emin misiniz?`)) {
      onDelete(workspace.id);
    }
    setShowActions(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setShowActions(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const selectedToolsCount = Object.keys(workspace.selections).length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        if (!isEditing) {
          setShowActions(false);
        }
      }}
    >
      <div
        onClick={() => !isEditing && onSelect(workspace)}
        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10"
      >
        {/* Action Buttons */}
        <AnimatePresence>
          {showActions && !isEditing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-3 right-3 flex space-x-2 z-10"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleEdit}
                className="p-2 bg-slate-700/80 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition-all duration-200"
              >
                <Edit2 size={14} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDelete}
                className="p-2 bg-slate-700/80 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition-all duration-200"
              >
                <Trash2 size={14} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Mode Buttons */}
        {isEditing && (
          <div className="absolute top-3 right-3 flex space-x-2 z-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSaveEdit}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Check size={14} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCancelEdit}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <X size={14} />
            </motion.button>
          </div>
        )}

        {/* Workspace Name */}
        <div className="mb-4">
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSaveEdit(e as any);
                if (e.key === 'Escape') handleCancelEdit(e as any);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none text-xl font-bold"
              autoFocus
            />
          ) : (
            <h3 className="text-xl font-bold text-white mb-2 pr-20">
              {workspace.name}
            </h3>
          )}
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex items-center text-slate-300">
            <Users className="w-4 h-4 mr-2 text-cyan-400" />
            <span className="text-sm">6 AI Agents</span>
          </div>
          
          <div className="flex items-center text-slate-300">
            <Calendar className="w-4 h-4 mr-2 text-purple-400" />
            <span className="text-sm">{selectedToolsCount}/5 Tools Selected</span>
          </div>
          
          <div className="flex items-center text-slate-300">
            <Clock className="w-4 h-4 mr-2 text-yellow-400" />
            <span className="text-sm">{formatDate(workspace.createdAt)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Configuration Progress</span>
            <span className="text-xs text-slate-400">{Math.round((selectedToolsCount / 5) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(selectedToolsCount / 5) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
            />
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            selectedToolsCount === 5 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          }`}>
            {selectedToolsCount === 5 ? 'Ready' : 'Setup'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface WorkspaceGridProps {
  workspaces: WorkspaceData[];
  onCreateNew: () => void;
  onSelectWorkspace: (workspace: WorkspaceData) => void;
  onRenameWorkspace: (id: string, newName: string) => void;
  onDeleteWorkspace: (id: string) => void;
}

export default function WorkspaceGrid({ 
  workspaces, 
  onCreateNew, 
  onSelectWorkspace,
  onRenameWorkspace,
  onDeleteWorkspace
}: WorkspaceGridProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">AI Workspace</h1>
        <p className="text-slate-400">Manage your AI agent configurations and workflows</p>
      </div>

      {/* Workspace Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Card */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreateNew}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border-2 border-dashed border-slate-600/50 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 flex flex-col items-center justify-center min-h-[280px] group"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 90 }}
              transition={{ duration: 0.2 }}
              className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-cyan-500/25"
            >
              <Plus className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-2">Yeni Workspace</h3>
            <p className="text-slate-400 text-center text-sm">
              Yeni bir AI workspace oluşturun ve ajanlarınızı yapılandırın
            </p>
          </motion.div>

          {/* Existing Workspaces */}
          <AnimatePresence>
            {workspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                onSelect={onSelectWorkspace}
                onRename={onRenameWorkspace}
                onDelete={onDeleteWorkspace}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {workspaces.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">Henüz workspace yok</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              AI ajanlarınızı yönetmek ve iş akışlarınızı oluşturmak için ilk workspace'inizi oluşturun.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateNew}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200"
            >
              İlk Workspace'i Oluştur
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}