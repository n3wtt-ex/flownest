import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { WorkspaceBoard } from '../components/AIWorkspace/WorkspaceBoard';
import { WorkspaceGrid } from '../components/AIWorkspace/WorkspaceGrid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useLanguage } from '../contexts/LanguageContext';

interface WorkspaceData {
  id: string;
  name: string;
  selections: { [key: string]: string };
  messages: any[];
  createdAt: string;
}

export function UIBot() {
  const { language } = useLanguage();
  const [workspaces, setWorkspaces] = useLocalStorage<WorkspaceData[]>('ai-workspaces', []);
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceData | null>(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const createWorkspace = () => {
    if (!newWorkspaceName.trim()) return;

    const newWorkspace: WorkspaceData = {
      id: Date.now().toString(),
      name: newWorkspaceName,
      selections: {},
      messages: [],
      createdAt: new Date().toISOString()
    };

    setWorkspaces(prev => [...prev, newWorkspace]);
    setCurrentWorkspace(newWorkspace);
    setNewWorkspaceName('');
    setIsCreateModalOpen(false);
  };

  const updateWorkspace = (updatedWorkspace: WorkspaceData) => {
    setWorkspaces(prev => 
      prev.map(w => w.id === updatedWorkspace.id ? updatedWorkspace : w)
    );
    setCurrentWorkspace(updatedWorkspace);
  };

  const openWorkspace = (workspace: WorkspaceData) => {
    setCurrentWorkspace(workspace);
  };

  const renameWorkspace = (id: string, newName: string) => {
    setWorkspaces(prev =>
      prev.map(w => (w.id === id ? { ...w, name: newName } : w))
    );
  };

  const deleteWorkspace = (id: string) => {
    setWorkspaces(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4"
          >
            <Bot className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-gray-900 mb-2"
          >
            AI Workspace
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg"
          >
            Orchestrate your AI agents and automation tools
          </motion.p>
        </div>

        {/* Workspace Area */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {!currentWorkspace ? (
            <WorkspaceGrid
              workspaces={workspaces}
              onSelectWorkspace={openWorkspace}
              onRenameWorkspace={renameWorkspace}
              onDeleteWorkspace={deleteWorkspace}
              onCreateWorkspace={() => setIsCreateModalOpen(true)}
            />
          ) : (
            /* Active Workspace */
            <div className="h-[800px]">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{currentWorkspace.name}</h2>
                  <p className="text-sm text-gray-600">
                    {language === 'tr' ? 'Oluşturuldu' : 'Created'} {new Date(currentWorkspace.createdAt).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                  </p>
                </div>
                <button
                  onClick={() => setCurrentWorkspace(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {language === 'tr' ? 'Çalışma Alanlarına Geri Dön' : 'Back to Workspaces'}
                </button>
              </div>
              
              <WorkspaceBoard
                workspace={currentWorkspace}
                onUpdateWorkspace={updateWorkspace}
              />
            </div>
          )}
        </div>
      </div>

      {/* Create Workspace Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'tr' ? 'Yeni Çalışma Alanı Oluştur' : 'Create New Workspace'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="text"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder={language === 'tr' ? 'Çalışma alanı adı girin...' : 'Enter workspace name...'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && createWorkspace()}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                {language === 'tr' ? 'İptal' : 'Cancel'}
              </button>
              <button
                onClick={createWorkspace}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
              >
                {language === 'tr' ? 'Oluştur' : 'Create'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
