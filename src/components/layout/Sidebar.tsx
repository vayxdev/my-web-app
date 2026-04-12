import React, { useState } from 'react';
import { Home, Languages, Text, Image, LucideIcon } from 'lucide-react';
import SidebarTab from './SidebarTab';

interface TabItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const TABS: TabItem[] = [
  { label: 'Home', path: '/', icon: Home },
  { label: '汉字', path: '/hanzi', icon: Languages },
  { label: '拼音', path: '/pinyin', icon: Text },
  { label: '排版', path: '/md2image', icon: Image },
] as const;

const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabClick = (path: string) => {
    onNavigate(path);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-2.5 left-2.5 z-[200] rounded-lg p-2.5 cursor-pointer shadow-lg transition-colors"
        style={{
          background: 'rgba(42, 37, 32, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(156, 149, 139, 0.15)',
        }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <Home size={20} color="#c4beb4" />
      </button>

      {/* Desktop dropdown */}
      <div
        className="hidden md:block fixed top-4 left-4 z-[100]"
        onMouseEnter={() => setIsDropdownOpen(true)}
        onMouseLeave={() => setIsDropdownOpen(false)}
      >
        <button
          style={{
            background: 'rgba(42, 37, 32, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(156, 149, 139, 0.15)',
            borderRadius: isDropdownOpen ? '10px 10px 0 0' : '10px',
            padding: '10px',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => handleTabClick('/')}
          aria-label="Home"
        >
          <Home size={20} color="#c4beb4" />
        </button>

        {isDropdownOpen && (
          <div
            style={{
              background: 'rgba(30, 28, 26, 0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(156, 149, 139, 0.1)',
              borderTop: 'none',
              borderRadius: '0 10px 10px 10px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              animation: 'slideDown 0.15s ease-out',
            }}
          >
            {TABS.map((tab) => (
              <SidebarTab
                key={tab.path}
                label={tab.label}
                path={tab.path}
                icon={tab.icon}
                isActive={currentPath === tab.path}
                showLabel={true}
                onClick={() => handleTabClick(tab.path)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile slide-out drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '240px',
          height: '100vh',
          background: 'rgba(20, 18, 16, 0.97)',
          backdropFilter: 'blur(20px)',
          boxShadow: '4px 0 30px rgba(0,0,0,0.4)',
          zIndex: 150,
          padding: '60px 12px 24px',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {TABS.map((tab) => (
          <SidebarTab
            key={tab.path}
            label={tab.label}
            path={tab.path}
            icon={tab.icon}
            isActive={currentPath === tab.path}
            onClick={() => handleTabClick(tab.path)}
          />
        ))}
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 140,
          }}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close overlay"
        />
      )}
    </>
  );
};

export default Sidebar;
