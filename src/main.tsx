import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LanguageProvider } from './contexts/LanguageContext.tsx'
import { ThemeProvider } from './components/ui/theme-provider.tsx'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" storageKey="theme">
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </ThemeProvider>
);