import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-slate-900/70 backdrop-blur-sm px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-12 pr-4 py-2.5 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <button className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50 transition-colors">
            <Bell className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-full flex items-center justify-center ring-2 ring-slate-700">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm">
              <div className="font-medium text-white">
                {user?.user_metadata?.full_name || user?.email}
              </div>
              <div className="text-slate-400">Admin</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
