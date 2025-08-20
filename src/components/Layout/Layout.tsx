import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AnimatePresence, motion } from 'framer-motion';
import { SidebarProvider } from '../../contexts/SidebarContext';

export function Layout() {
  const location = useLocation();

  // Tema değişikliğini uygulamak için useEffect
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // CRM sayfaları için farklı arka plan rengi
  const isCrmPage = location.pathname.startsWith('/crm');

  return (
    <SidebarProvider>
      <div className={`flex h-screen ${isCrmPage ? 'bg-slate-50' : 'bg-white'} text-slate-800 dark:text-slate-100 dark:bg-crm-dark`}>
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
