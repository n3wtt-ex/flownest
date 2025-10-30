import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AnimatePresence, motion } from 'framer-motion';
import { SidebarProvider } from '../../contexts/SidebarContext';

export function Layout() {
  const location = useLocation();

  // CRM sayfaları için farklı arka plan rengi
  const isCrmPage = location.pathname.startsWith('/crm');

  return (
    <SidebarProvider>
      <div className={`flex h-screen ${isCrmPage ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-950'} text-gray-900 dark:text-white`}>
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
          <Header />
          <main className="flex-1 overflow-y-auto bg-transparent">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-transparent"
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