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
    <div className="flex h-full w-64 flex-col bg-white border-r border-slate-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">SalesBot</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-6">
        {/* Main Navigation */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Ana Modüller
          </h3>
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  clsx(
                    'group flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors duration-150',
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={clsx("mr-3 h-5 w-5 flex-shrink-0", isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700")} />
                    <div className="flex-1">
                      <div>{item.name}</div>
                      <div className="text-xs text-slate-500">
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
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
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
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )
                }
              >
                <item.icon className="mr-3 h-4 w-4 flex-shrink-0 text-slate-400 group-hover:text-slate-600" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-slate-200 p-4 space-y-2">
        <NavLink
          to="/settings"
          className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <Settings className="mr-3 h-4 w-4" />
          Ayarlar
        </NavLink>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}
