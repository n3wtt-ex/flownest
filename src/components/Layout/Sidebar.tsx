import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bot,
  Mail,
  Search,
  Megaphone,
  MessageSquare,
  Users,
  Building2,
  Handshake,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import clsx from 'clsx';

// DO NOT MODIFY CRM/ACCOUNT PAGES - These are production components
const mainNavItems = [
  { name: 'AI Workspace', href: '/ui-bot', icon: Bot, description: 'AI Workspace' },
  { name: 'Email Hesabı', href: '/email', icon: Mail, description: 'Email Management' },
  { name: 'Lead Bulma', href: '/leads', icon: Search, description: 'Lead Finding' },
  { name: 'Kampanya', href: '/campaigns', icon: Megaphone, description: 'Campaigns' },
  { name: 'Yanıt Takibi', href: '/responses', icon: MessageSquare, description: 'Response Tracking' },
  { name: 'CRM', href: '/crm', icon: Users, description: 'Customer Management' },
];

const crmNavItems = [
  { name: 'Dashboard', href: '/crm', icon: BarChart3 },
  { name: 'Contacts', href: '/crm/contacts', icon: Users },
  { name: 'Companies', href: '/crm/companies', icon: Building2 },
  { name: 'Deals', href: '/crm/deals', icon: Handshake },
];

export function Sidebar() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex h-full w-64 flex-col bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">SalesBot</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-8">
        {/* Main Navigation */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Ana Modüller
          </h3>
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  clsx(
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105',
                    isActive
                      ? 'bg-gradient-to-r from-sky-500/20 to-indigo-600/20 text-white shadow-inner'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={clsx("mr-3 h-5 w-5 flex-shrink-0", isActive ? "text-sky-400" : "text-slate-400 group-hover:text-white")} />
                    <div className="flex-1">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs text-slate-400 group-hover:text-slate-300">
                        {item.description}
                      </div>
                    </div>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* CRM Sub-navigation */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            CRM Modülleri
          </h3>
          <div className="space-y-1">
            {crmNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/crm'}
                className={({ isActive }) =>
                  clsx(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  )
                }
              >
                <item.icon className="mr-3 h-4 w-4 flex-shrink-0 text-slate-400 group-hover:text-white" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-slate-700/50 p-4 space-y-2">
        <NavLink
          to="/settings"
          className="flex items-center px-3 py-2 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-700/50 hover:text-white transition-colors"
        >
          <Settings className="mr-3 h-4 w-4" />
          Ayarlar
        </NavLink>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-700/50 hover:text-white transition-colors"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}
