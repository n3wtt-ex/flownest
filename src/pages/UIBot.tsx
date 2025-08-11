import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Plus, Play } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { WorkspaceBoard } from '../components/AIWorkspace/WorkspaceBoard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';

interface WorkspaceData {
  id: string;
  name: string;
  selections: { [key: string]: string };
  messages: any[];
  createdAt: string;
}

export function UIBot() {
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

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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
            /* Create Workspace CTA */
            <div className="h-[600px] flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                {workspaces.length === 0 ? (
                  /* First time - Create button */
                  <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-48 h-48 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-white flex flex-col items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300"
                      >
                        <Plus className="w-12 h-12 mb-4" />
                        <div className="text-xl font-bold">AI Work Space</div>
                        <div className="text-sm opacity-90">Create</div>
                      </motion.button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Workspace</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={newWorkspaceName}
                          onChange={(e) => setNewWorkspaceName(e.target.value)}
                          placeholder="Enter workspace name..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onKeyPress={(e) => e.key === 'Enter' && createWorkspace()}
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={createWorkspace}
                            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                          >
                            Create
                          </button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  /* Has workspaces - Show recent + create */
                  <div className="space-y-6">
                    <div className="text-2xl font-bold text-gray-900 mb-4">Your Workspaces</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
                      {workspaces.slice(-6).map((workspace) => (
                        <motion.button
                          key={workspace.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => openWorkspace(workspace)}
                          className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 text-left"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <Play className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(workspace.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="font-semibold text-gray-900 mb-1">{workspace.name}</div>
                          <div className="text-sm text-gray-600">
                            {Object.keys(workspace.selections).length} tools selected
                          </div>
                        </motion.button>
                      ))}
                      
                      {/* Create New Button */}
                      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex flex-col items-center justify-center min-h-[120px]"
                          >
                            <Plus className="w-8 h-8 text-gray-400 mb-2" />
                            <div className="text-gray-600 font-medium">Create New</div>
                          </motion.button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Workspace</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <input
                              type="text"
                              value={newWorkspaceName}
                              onChange={(e) => setNewWorkspaceName(e.target.value)}
                              placeholder="Enter workspace name..."
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              onKeyPress={(e) => e.key === 'Enter' && createWorkspace()}
                            />
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={createWorkspace}
                                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                              >
                                Create
                              </button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          ) : (
            /* Active Workspace */
            <div className="h-[800px]">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{currentWorkspace.name}</h2>
                  <p className="text-sm text-gray-600">
                    Created {new Date(currentWorkspace.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setCurrentWorkspace(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Back to Workspaces
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
    </div>
  );
}