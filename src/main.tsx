import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { CampaignsProvider } from './pages/CampaignsContext';
import { LanguageProvider } from './contexts/LanguageContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <CampaignsProvider>
        <App />
      </CampaignsProvider>
    </LanguageProvider>
  </StrictMode>
);
