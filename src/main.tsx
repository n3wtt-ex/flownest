import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { CampaignsProvider } from './pages/CampaignsContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CampaignsProvider>
      <App />
    </CampaignsProvider>
  </StrictMode>
);
