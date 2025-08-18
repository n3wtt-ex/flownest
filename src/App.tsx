import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout/Layout';
import { LoginRegister } from './components/Auth/LoginRegister';
import { Dashboard } from './components/CRM/Dashboard';
import { Contacts } from './components/CRM/Contacts';
import { Companies } from './components/CRM/Companies';
import { Deals } from './components/CRM/Deals';
import { UIBot } from './pages/UIBot';
import { Email } from './pages/Email';
import { Leads } from './pages/LeadsManagement';
import { Campaigns } from './pages/Campaigns';
import { Responses } from './pages/Responses';
import { Settings } from './pages/Settings';

// Dashboard wrapper bileşeni
function DashboardWrapper() {
  const navigate = useNavigate();

  const handleNavigate = (section: string) => {
    switch (section) {
      case 'contacts':
        navigate('/crm/contacts');
        break;
      case 'companies':
        navigate('/crm/companies');
        break;
      case 'deals':
        navigate('/crm/deals');
        break;
      default:
        navigate(`/crm/${section}`);
        break;
    }
  };

  return <Dashboard onNavigate={handleNavigate} />;
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/register" element={<LoginRegister />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/ui-bot" replace />} />
          <Route path="ui-bot" element={<UIBot />} />
          <Route path="email" element={<Email />} />
          <Route path="leads" element={<Leads />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="responses" element={<Responses />} />
          <Route path="crm" element={<DashboardWrapper />} />
          <Route path="crm/contacts" element={<Contacts />} />
          <Route path="crm/companies" element={<Companies />} />
          <Route path="crm/deals" element={<Deals />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
