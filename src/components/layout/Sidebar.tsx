import React, { useState } from 'react';
import { Home, ScrollText, Languages, Text, Image, LucideIcon } from 'lucide-react';
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
  { label: 'EventLogger', path: '/event-logger', icon: ScrollText },
  { label: 'Hanzi', path: '/hanzi', icon: Languages },
  { label: 'Pinyin', path: '/pinyin', icon: Text },
  { label: 'Md2Image', path: '/md2image', icon: Image },
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
      <button
        className="md:hidden fixed top-2.5 left-2.5 z-[200] bg-green-500 rounded-lg p-2.5 cursor-pointer shadow-lg hover:bg-green-600 transition-colors"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <Home size={24} color="white" />
      </button>

      <div
        className="hidden md:block fixed top-4 left-4 z-[100]"
        onMouseEnter={() => setIsDropdownOpen(true)}
        onMouseLeave={() => setIsDropdownOpen(false)}
      >
        <button
          className={`bg-gray-200 text-gray-700 rounded-lg p-3 cursor-pointer shadow-lg transition-all duration-300 ${isDropdownOpen ? 'rounded-br-none' : 'hover:bg-gray-300'}`}
          onClick={() => handleTabClick('/')}
          aria-label="Home"
        >
          <Home size={24} />
        </button>

        {isDropdownOpen && (
          <div className="mt-0 bg-white/90 border border-gray-200 rounded-lg rounded-tl-none shadow-lg overflow-hidden backdrop-blur-sm">
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

      <div
        className={`fixed top-0 left-0 w-[250px] h-screen bg-white shadow-xl z-[150] p-4 pt-[60px] transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
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

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[140]"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close overlay"
        />
      )}
    </>
  );
};

export default Sidebar;
