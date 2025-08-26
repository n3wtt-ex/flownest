import React from 'react';
import { Bell, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ThemeToggle } from '../ui/theme-toggle';
import { OrganizationSelector } from '../Organization/OrganizationSelector';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <OrganizationSelector />
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-sm">
              <div className="font-medium text-foreground">
                {user?.user_metadata?.full_name || user?.email}
              </div>
              <div className="text-muted-foreground">Admin</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
