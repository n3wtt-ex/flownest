import React, { useEffect } from 'react';
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
import AdminPanel from './pages/AdminPanel';
import Support from './pages/Support';
import Landing from './pages/Landing';
import EmailConfirmation from './pages/EmailConfirmation';
import AuthError from './pages/AuthError';
import MultiStepFormPage from './pages/MultiStepFormPage';
import { CampaignsProvider } from './contexts/CampaignsContext';
import { OrganizationProvider } from './contexts/OrganizationContext';

// Landing page wrapper with forced light theme
function LandingWithLightTheme() {
  return (
    <div className="light bg-landing-dark text-white min-h-screen">
      <Landing />
    </div>
  );
}

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <CampaignsProvider>
        <OrganizationProvider>
          <Routes>
            <Route path="/" element={<LandingWithLightTheme />} />
            <Route path="/login" element={<LoginRegister />} />
            <Route path="/register" element={<LoginRegister />} />
            <Route path="/auth/confirm" element={<EmailConfirmation />} />
            <Route path="/auth/error" element={<AuthError />} />
            <Route path="/multistep-form" element={<MultiStepFormPage />} />
            {user ? (
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
                <Route path="admin" element={<AdminPanel />} />
                <Route path="support" element={<Support />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            ) : (
              <Route path="*" element={<Navigate to="/login" replace />} />
            )}
          </Routes>
        </OrganizationProvider>
      </CampaignsProvider>
    </Router>
  );
}

export default App;