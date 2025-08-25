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
    console.log('Layout - Saved theme from localStorage:', savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      console.log('Layout - Dark theme applied');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('Layout - Light theme applied');
    }
    
    // Tema değişikliğinin uygulandığını kontrol et
    setTimeout(() => {
      console.log('Layout - Current theme class:', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    }, 0);
  }, []);

  // CRM sayfaları için farklı arka plan rengi
  const isCrmPage = location.pathname.startsWith('/crm');

  return (
    <SidebarProvider>
      <div className={`flex h-screen ${isCrmPage ? 'bg-slate-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-900'} text-slate-800 dark:text-slate-100`}>
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