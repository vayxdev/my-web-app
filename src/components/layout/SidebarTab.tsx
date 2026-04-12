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
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: showLabel ? '10px' : '0',
        justifyContent: showLabel ? 'flex-start' : 'center',
        padding: showLabel ? '10px 16px' : '10px 8px',
        background: isActive ? 'rgba(196, 148, 66, 0.1)' : 'transparent',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        marginBottom: '2px',
        transition: 'all 0.2s ease',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent';
      }}
      aria-label={`Navigate to ${label}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon size={16} color={isActive ? '#c49442' : '#7a756e'} />
      {showLabel && (
        <span
          style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '13px',
            fontWeight: isActive ? 600 : 400,
            color: isActive ? '#c49442' : '#9c958b',
            letterSpacing: '0.5px',
          }}
        >
          {label}
        </span>
      )}
    </button>
  );
};

export default SidebarTab;
