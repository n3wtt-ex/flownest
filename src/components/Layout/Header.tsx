import React from 'react';
import { Bell, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ThemeToggle } from '../ui/theme-toggle';
import { OrganizationSelector } from '../Organization/OrganizationSelector';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <OrganizationSelector />
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900 dark:text-white">
                {user?.user_metadata?.full_name || user?.email}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Admin</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
