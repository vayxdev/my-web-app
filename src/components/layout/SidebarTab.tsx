import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SidebarTabProps {
  label: string;
  path: string;
  icon: LucideIcon;
  isActive: boolean;
  showLabel?: boolean;
  onClick: () => void;
}

const SidebarTab: React.FC<SidebarTabProps> = ({ label, icon: Icon, isActive, showLabel = true, onClick }) => {
  return (
    <button
      className={`w-full flex items-center border-none rounded-lg mb-1 cursor-pointer transition-all duration-200 ${
        showLabel ? 'justify-start px-5' : 'justify-center px-2'
      } py-3 ${isActive
        ? 'bg-green-50 font-semibold hover:bg-green-100'
        : 'bg-transparent font-normal hover:bg-gray-100'
      }`}
      onClick={onClick}
      aria-label={`Navigate to ${label}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon size={18} color={isActive ? '#2e7d32' : '#666'} />
      {showLabel && <span className="ml-2.5">{label}</span>}
    </button>
  );
};

export default SidebarTab;
