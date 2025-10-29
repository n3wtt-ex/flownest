import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Users, Edit2, Trash2, Check, X } from 'lucide-react';
import { WorkspaceBoard } from './WorkspaceBoard';
import { supabase } from '../../lib/supabaseClient';

// Dialog bileşenlerini import ediyoruz
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';

interface WorkspaceData {
  id: string;
  name: string;
  selections: { [key: string]: string };
  messages: any[];
  createdAt: string;
  onboardingCompleted?: boolean;
}

interface WorkspaceGridProps {
  workspaces: WorkspaceData[];
  onSelectWorkspace: (workspace: WorkspaceData) => void;
  onRenameWorkspace: (id: string, newName: string) => void;
  onDeleteWorkspace: (id: string) => void;
  onCreateWorkspace: () => void;
}

export function WorkspaceGrid({ 
  workspaces, 
  onSelectWorkspace, 
  onRenameWorkspace, 
  onDeleteWorkspace,
  onCreateWorkspace 
}: WorkspaceGridProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [workspaceTools, setWorkspaceTools] = useState<{[key: string]: {[agent: string]: string}}>({});
  
  // Her workspace için araç verilerini çek
  useEffect(() => {
    const fetchAllWorkspaceTools = async () => {
      try {
        const tools: {[key: string]: {[agent: string]: string}} = {};
        
        for (const workspace of workspaces) {
          const { data, error } = await supabase
            .from('workspace')
            .select('*')
            .eq('workspace_id', workspace.id)
            .single();
            
          if (!error && data) {
            const workspaceTools: {[agent: string]: string} = {};
            Object.keys(data).forEach(agent => {
              if (agent !== 'workspace_id' && data[agent]) {
                workspaceTools[agent] = data[agent];
              }
            });
            tools[workspace.id] = workspaceTools;
          } else {
            // Eğer Supabase'de kayıt yoksa, boş obje ekle
            tools[workspace.id] = {};
          }
        }
        
        setWorkspaceTools(tools);
      } catch (error) {
        console.error('Error fetching workspace tools:', error);
      }
    };
    
    if (workspaces.length > 0) {
      fetchAllWorkspaceTools();
      
      // Her 3 saniyede bir güncelle
      const interval = setInterval(fetchAllWorkspaceTools, 3000);
      return () => clearInterval(interval);
    }
  }, [workspaces]);

  const handleEditStart = (workspace: WorkspaceData, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(workspace.id);
    setEditName(workspace.name);
  };

  const handleEditSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editName.trim()) {
      onRenameWorkspace(id, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleEditCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditName('');
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteDialogId) {
      onDeleteWorkspace(deleteDialogId);
      setDeleteDialogId(null);
    }
  };

  const getSelectedToolsCount = (workspaceId: string) => {
    // workspaceTools doğrudan workspaces prop'undan türetildiği için burada doğrudan erişebiliriz
    if (workspaceTools[workspaceId]) {
      // Sadece null olmayan araçları say
      const tools = Object.values(workspaceTools[workspaceId]).filter(tool => tool !== null && tool !== undefined && tool !== '');
      console.log(`[WorkspaceGrid] Workspace ${workspaceId} tools:`, workspaceTools[workspaceId]);
      console.log(`[WorkspaceGrid] Workspace ${workspaceId} filtered tools:`, tools);
      console.log(`[WorkspaceGrid] Workspace ${workspaceId} tool count: ${tools.length}`);
      return tools.length;
    }
    
    console.log(`[WorkspaceGrid] No tools found for workspace ${workspaceId}`);
    // Hiçbir veri yoksa 0 döndür
    return 0;
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

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AI Workspace Yöneticisi</h1>
          <p className="text-slate-400">Projelerinizi organize edin ve ekip çalışmasını kolaylaştırın</p>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Create New Workspace Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreateWorkspace}
            className="bg-slate-800/50 backdrop-blur-sm border-2 border-dashed border-slate-600 rounded-xl p-6 cursor-pointer hover:border-cyan-400 transition-all duration-300 group"
          >
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Yeni Workspace</h3>
              <p className="text-slate-400 text-sm">Yeni bir proje başlatın</p>
            </div>
          </motion.div>

          {/* Existing Workspace Cards */}
          {workspaces.map((workspace) => (
            <motion.div
              key={workspace.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectWorkspace(workspace)}
              className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 cursor-pointer hover:border-cyan-400/50 transition-all duration-300 group relative overflow-hidden"
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Edit/Delete Buttons */}
              <div className="absolute top-3 right-3 flex space-x-1 transition-all duration-200" style={{ zIndex: 20 }}>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                  {editingId === workspace.id ? (
                    <>
                      <button
                        onClick={(e) => handleEditSave(workspace.id, e)}
                        className="p-1.5 bg-green-500/90 text-white rounded-lg hover:bg-green-600 transition-colors shadow-lg"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="p-1.5 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => handleEditStart(workspace, e)}
                        className="p-1.5 bg-slate-700/90 text-white rounded-lg hover:bg-cyan-500 transition-colors shadow-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(workspace.id, e)}
                        className="p-1.5 bg-slate-700/90 text-white rounded-lg hover:bg-red-500 transition-colors shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="relative z-5">
                {/* Title */}
                <div className="mb-4">
                  {editingId === workspace.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleEditSave(workspace.id, e as any);
                        } else if (e.key === 'Escape') {
                          handleEditCancel(e as any);
                        }
                      }}
                      className="w-full bg-slate-700 text-white px-3 py-1 rounded-lg border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      autoFocus
                    />
                  ) : (
                    <h3 className="text-white font-semibold text-lg group-hover:text-cyan-300 transition-colors">
                      {workspace.name}
                    </h3>
                  )}
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-slate-300">
                    <Users className="w-4 h-4 mr-2 text-cyan-400" />
                    <span className="text-sm">{getSelectedToolsCount(workspace.id)}/7 Araç Seçili</span>
                  </div>
                  <div className="flex items-center text-slate-300">
                    <Calendar className="w-4 h-4 mr-2 text-purple-400" />
                    <span className="text-sm">{formatDate(workspace.createdAt)}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(getSelectedToolsCount(workspace.id) / 7) * 100}%` }}
                  />
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    getSelectedToolsCount(workspace.id) === 7 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {getSelectedToolsCount(workspace.id) === 7 ? 'Hazır' : 'Yapılandırılıyor'}
                  </span>
                </div>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {workspaces.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">Henüz workspace yok</h3>
            <p className="text-slate-400 mb-6">İlk workspace'inizi oluşturun ve ekip çalışmasına başlayın</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateWorkspace}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-shadow duration-200"
            >
              Yeni Workspace Oluştur
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialogId} onOpenChange={() => setDeleteDialogId(null)}>
        <DialogContent 
          className="bg-slate-800 border-slate-700 text-white"
          aria-describedby="delete-dialog-description"
        >
          <DialogHeader>
            <DialogTitle className="text-white">Workspace'i Sil</DialogTitle>
            <DialogDescription 
              id="delete-dialog-description"
              className="text-slate-400"
            >
              Bu workspace'i silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setDeleteDialogId(null)}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Sil
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}