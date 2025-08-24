import React from 'react';
import { Bell, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 dark:bg-slate-800 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex-1"></div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700">
            <Bell className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center dark:bg-slate-700">
              <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </div>
            <div className="text-sm">
              <div className="font-medium text-slate-900 dark:text-white">
                {user?.user_metadata?.full_name || user?.email}
              </div>
              <div className="text-slate-500 dark:text-slate-400">Admin</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
