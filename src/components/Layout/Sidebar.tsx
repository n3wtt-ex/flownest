import React, { useState, useRef, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import clsx from 'clsx';
import { useSidebar } from '../../contexts/SidebarContext';
import { useLanguage } from '../../contexts/LanguageContext';

// DO NOT MODIFY CRM/ACCOUNT PAGES - These are production components
const mainNavItems = [
  { name: { tr: 'AI Workspace', en: 'AI Workspace' }, href: '/ui-bot', icon: Bot },
  { name: { tr: 'Email Hesabı', en: 'Email Account' }, href: '/email', icon: Mail },
  { name: { tr: 'Lead Yönetimi', en: 'Lead Management' }, href: '/leads', icon: Search },
  { name: { tr: 'Kampanya', en: 'Campaign' }, href: '/campaigns', icon: Megaphone },
  { name: { tr: 'Yanıt Takibi', en: 'Response Tracking' }, href: '/responses', icon: MessageSquare },
  { name: { tr: 'CRM', en: 'CRM' }, href: '/crm', icon: Users },
];

const crmNavItems = [
  { name: { tr: 'Panel', en: 'Dashboard' }, href: '/crm', icon: BarChart3 },
  { name: { tr: 'Kişiler', en: 'Contacts' }, href: '/crm/contacts', icon: Users },
  { name: { tr: 'Şirketler', en: 'Companies' }, href: '/crm/companies', icon: Building2 },
  { name: { tr: 'Fırsatlar', en: 'Deals' }, href: '/crm/deals', icon: Handshake },
];

export function Sidebar() {
  const { signOut } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { language } = useLanguage();
  const [tooltip, setTooltip] = useState<{name: string, x: number, y: number} | null>(null);
  const collapseButtonRef = useRef<HTMLButtonElement>(null);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleMouseEnter = (e: React.MouseEvent, name: string) => {
    if (isCollapsed) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip({
        name,
        x: rect.right + 10,
        y: rect.top + rect.height / 2
      });
    }
  };

  const handleMouseLeave = () => {
    if (isCollapsed) {
      setTooltip(null);
    }
  };

  // Close tooltip when sidebar is expanded
  useEffect(() => {
    if (!isCollapsed) {
      setTooltip(null);
    }
  }, [isCollapsed]);

  return (
    <>
      <div className={clsx(
        "flex h-full flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Logo */}
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo_flownests-_2_.svg" 
              alt="FlowNests Logo" 
              className={clsx(
                "transition-all duration-300 ease-in-out", 
                isCollapsed ? "w-10 h-10" : "w-10 h-10"
              )}
            />
            <span className={clsx(
              "text-xl font-bold text-slate-900 transition-all duration-300 ease-in-out",
              isCollapsed ? "opacity-0 w-0 h-0 overflow-hidden" : "opacity-100"
            )}>
              FlowNests
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-6">
          {/* Main Navigation */}
          <div>
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {language === 'tr' ? 'Ana Modüller' : 'Main Modules'}
              </h3>
            )}
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.name.tr}
                  to={item.href}
                  onMouseEnter={(e) => handleMouseEnter(e, item.name[language])}
                  onMouseLeave={handleMouseLeave}
                  className={({ isActive }) =>
                    clsx(
                      'group flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors duration-150',
                      isCollapsed ? "justify-center" : "",
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={clsx(
                        "flex-shrink-0", 
                        isCollapsed ? "h-5 w-5" : "mr-3 h-5 w-5",
                        isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"
                      )} />
                      {!isCollapsed && (
                        <div className="flex-1">
                          <div>{item.name[language]}</div>
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/* CRM Sub-navigation */}
          <div>
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {language === 'tr' ? 'CRM Modülleri' : 'CRM Modules'}
              </h3>
            )}
            <div className="space-y-1">
              {crmNavItems.map((item) => (
                <NavLink
                  key={item.name.tr}
                  to={item.href}
                  end={item.href === '/crm'}
                  onMouseEnter={(e) => handleMouseEnter(e, item.name[language])}
                  onMouseLeave={handleMouseLeave}
                  className={({ isActive }) =>
                    clsx(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      isCollapsed ? "justify-center" : "",
                      isActive
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )
                  }
                >
                  <item.icon className={clsx(
                    "flex-shrink-0",
                    isCollapsed ? "h-4 w-4" : "mr-3 h-4 w-4",
                    "text-slate-400 group-hover:text-slate-600"
                  )} />
                  {!isCollapsed && item.name[language]}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-slate-200 p-4 space-y-2">
          <NavLink
            to="/settings"
            onMouseEnter={(e) => handleMouseEnter(e, language === 'tr' ? "Ayarlar" : "Settings")}
            onMouseLeave={handleMouseLeave}
            className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Settings className={clsx(
              "flex-shrink-0",
              isCollapsed ? "h-4 w-4" : "mr-3 h-4 w-4"
            )} />
            {!isCollapsed && (language === 'tr' ? "Ayarlar" : "Settings")}
          </NavLink>
          <button
            onClick={handleSignOut}
            onMouseEnter={(e) => handleMouseEnter(e, language === 'tr' ? "Çıkış Yap" : "Sign Out")}
            onMouseLeave={handleMouseLeave}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <LogOut className={clsx(
              "flex-shrink-0",
              isCollapsed ? "h-4 w-4" : "mr-3 h-4 w-4"
            )} />
            {!isCollapsed && (language === 'tr' ? "Çıkış Yap" : "Sign Out")}
          </button>
        </div>
      </div>

      {/* Collapse/Expand Button */}
      <button
        ref={collapseButtonRef}
        onClick={toggleSidebar}
        className={clsx(
          "fixed top-1/2 transform -translate-y-1/2 bg-white border border-slate-200 rounded-r-lg shadow-md hover:bg-slate-50 transition-all duration-200 flex items-center justify-center z-50",
          isCollapsed ? "left-16 w-6 h-10" : "left-64 w-4 h-8"
        )}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-slate-500" />
        )}
      </button>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateY(-50%)'
          }}
        >
          {tooltip.name}
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-gray-900"></div>
        </div>
      )}
    </>
  );
}