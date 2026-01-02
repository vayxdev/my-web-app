import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import './styles/tailwind.css';
import Home from './components/pages/Home';
import EventLogger from './components/pages/EventLogger';
import Hanzi from './components/pages/Hanzi';
import PinyinAnnotator from './components/pages/Pinyin';
import Md2Image from './components/pages/Md2Image';
import GoogleAnalytics from './services/GoogleAnalytics';
import Sidebar from './components/layout/Sidebar';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const mainContentStyle: React.CSSProperties = {
    display: 'flex',
    width: '100%',
  };

  const pageContentStyle: React.CSSProperties = {
    flex: 1,
    marginLeft: '0',
    minHeight: '100vh',
  };

  return (
    <div style={mainContentStyle}>
      <Sidebar
        currentPath={location.pathname}
        onNavigate={handleNavigate}
      />
      <div style={pageContentStyle}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/event-logger" element={<EventLogger />} />
          <Route path="/hanzi" element={<Hanzi />} />
          <Route path="/pinyin" element={<PinyinAnnotator />} />
          <Route path="/md2image" element={<Md2Image />} />
        </Routes>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <div>
      <GoogleAnalytics measurementId="G-BTS9Y6FD7T" />
      <Router>
        <AppContent />
      </Router>
    </div>
  </React.StrictMode>
);
