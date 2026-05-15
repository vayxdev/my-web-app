import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SidebarTabProps {
  label: string;
  path: string;
  icon: LucideIcon;
  isActive: boolean;
  collapsed?: boolean;
  onClick: () => void;
}

const SidebarTab: React.FC<SidebarTabProps> = ({ label, icon: Icon, isActive, collapsed = false, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      aria-label={label}
      title={collapsed ? label : undefined}
      className={`group relative w-full flex items-center ${
        collapsed ? 'justify-center px-0' : 'gap-3 px-3 justify-start'
      } py-2 rounded-md transition-colors ${
        isActive ? 'bg-accent-soft/40 text-accent' : 'text-muted hover:text-text hover:bg-surface'
      }`}
    >
      <Icon size={16} strokeWidth={1.8} />
      {!collapsed && (
        <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>{label}</span>
      )}

      {collapsed && (
        <span
          className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-md bg-text text-bg text-xs px-2 py-1 opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0 z-50 shadow-soft"
          role="tooltip"
        >
          {label}
        </span>
      )}
    </button>
  );
};

export default SidebarTab;
