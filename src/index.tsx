import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import './styles/tailwind.css';
import Home from './components/pages/Home';
import Hanzi from './components/pages/Hanzi';
import PinyinAnnotator from './components/pages/Pinyin';
import Markdown from './components/pages/Markdown';
import GoogleAnalytics from './services/GoogleAnalytics';
import Sidebar, { SidebarState } from './components/layout/Sidebar';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';

const SIDEBAR_KEY = 'sidebar-state';

const readInitialSidebarState = (): SidebarState => {
  if (typeof window === 'undefined') return 'collapsed';
  try {
    const stored = window.localStorage.getItem(SIDEBAR_KEY);
    if (stored === 'collapsed' || stored === 'hidden') return stored;
  } catch {}
  return 'collapsed';
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarState, setSidebarState] = useState<SidebarState>(readInitialSidebarState);

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_KEY, sidebarState);
    } catch {}
  }, [sidebarState]);

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-bg text-text">
      <Sidebar
        currentPath={location.pathname}
        onNavigate={(path) => navigate(path)}
        state={sidebarState}
        onStateChange={setSidebarState}
      />
      <main className="flex-1 min-h-screen min-w-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hanzi" element={<Hanzi />} />
          <Route path="/pinyin" element={<PinyinAnnotator />} />
          <Route path="/markdown" element={<Markdown />} />
        </Routes>
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <GoogleAnalytics measurementId="G-BTS9Y6FD7T" />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);
