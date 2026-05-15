import React, { useState } from 'react';
import {
  Home,
  Languages,
  Type,
  FileImage,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  LucideIcon,
} from 'lucide-react';
import SidebarTab from './SidebarTab';
import ThemeToggle from '../theme/ThemeToggle';
import { site } from '../../config/site';

export type SidebarState = 'collapsed' | 'hidden';

interface TabItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  state: SidebarState;
  onStateChange: (next: SidebarState) => void;
}

const TABS: TabItem[] = [
  { label: '首页',     path: '/',         icon: Home },
  { label: 'Markdown', path: '/markdown', icon: FileImage },
  { label: '汉字',     path: '/hanzi',    icon: Languages },
  { label: '拼音',     path: '/pinyin',   icon: Type },
];

const widthClass = (state: SidebarState) =>
  state === 'collapsed' ? 'w-[64px]' : 'w-0';

interface NavListProps {
  collapsed?: boolean;
  groupLabel?: string;
  currentPath: string;
  onNavigate: (path: string) => void;
}

const NavList: React.FC<NavListProps> = ({ collapsed, groupLabel, currentPath, onNavigate }) => (
  <nav className={`flex-1 overflow-y-auto overflow-x-hidden ${collapsed ? 'px-2' : 'px-3'} py-2`}>
    {groupLabel && !collapsed && (
      <div className="text-[10px] uppercase tracking-[0.18em] font-medium text-subtle px-3 mb-2">
        {groupLabel}
      </div>
    )}
    <ul className="space-y-0.5">
      {TABS.map((tab) => (
        <li key={tab.path}>
          <SidebarTab
            label={tab.label}
            path={tab.path}
            icon={tab.icon}
            isActive={currentPath === tab.path}
            collapsed={collapsed}
            onClick={() => onNavigate(tab.path)}
          />
        </li>
      ))}
    </ul>
  </nav>
);

const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, state, onStateChange }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hidden = state === 'hidden';
  const expanded = !hidden && isHovered;

  const handleMobileNavigate = (path: string) => {
    onNavigate(path);
    setIsMobileOpen(false);
  };

  const asideWidthClass = hidden ? 'w-0' : expanded ? 'w-[200px]' : 'w-[64px]';

  return (
    <>
      <aside
        aria-hidden={hidden}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden md:flex flex-col fixed left-0 top-0 z-30 h-screen border-r border-border bg-bg overflow-hidden transition-[width,border-color] duration-200 ${asideWidthClass} ${
          hidden ? 'border-r-transparent pointer-events-none' : expanded ? 'shadow-soft' : ''
        }`}
      >
        <div className={`flex items-center py-5 transition-[padding,justify-content] duration-200 ${expanded ? 'px-4 justify-start gap-2' : 'justify-center'}`}>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-white font-semibold text-xs tracking-wider"
            aria-label={`${site.name} 首页`}
            title={site.name}
          >
            {site.shortLabel}
          </button>
          {expanded && (
            <span className="font-semibold tracking-tight text-text text-sm whitespace-nowrap">{site.name}</span>
          )}
        </div>

        <NavList collapsed={!expanded} currentPath={currentPath} onNavigate={onNavigate} />

        <div className={`border-t border-border py-3 flex transition-[padding,gap] duration-200 ${
          expanded ? 'px-3 flex-row items-center justify-between gap-2' : 'px-2 flex-col items-center gap-2'
        }`}>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => onStateChange('hidden')}
            aria-label="完全隐藏侧边栏"
            title="隐藏"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-elevated text-muted hover:text-text hover:border-subtle transition-colors"
          >
            <PanelLeftClose size={16} strokeWidth={1.8} />
          </button>
        </div>
      </aside>

      <div
        className={`hidden md:block shrink-0 transition-[width] duration-200 ${widthClass(state)}`}
        aria-hidden
      />

      {hidden && (
        <button
          type="button"
          onClick={() => onStateChange('collapsed')}
          aria-label="显示侧边栏"
          title="显示侧边栏"
          className="hidden md:inline-flex fixed left-3 top-3 z-40 h-9 w-9 items-center justify-center rounded-md border border-border bg-elevated text-muted hover:text-text hover:border-subtle shadow-soft transition-colors animate-fade-in"
        >
          <PanelLeftOpen size={16} strokeWidth={1.8} />
        </button>
      )}

      <header className="md:hidden sticky top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-bg/85 backdrop-blur border-b border-border">
        <button
          type="button"
          onClick={() => handleMobileNavigate('/')}
          className="flex items-center gap-2 text-text"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-accent text-white font-semibold text-[10px] tracking-wider">
            {site.shortLabel}
          </span>
          <span className="font-semibold tracking-tight text-sm">{site.name}</span>
        </button>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsMobileOpen((v) => !v)}
            aria-label={isMobileOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={isMobileOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-text"
          >
            {isMobileOpen ? <X size={18} strokeWidth={1.8} /> : <Menu size={18} strokeWidth={1.8} />}
          </button>
        </div>

        <div
          aria-hidden={!isMobileOpen}
          className={`absolute top-full left-0 right-0 origin-top bg-bg border-b border-border shadow-soft transition-[opacity,transform] duration-200 ease-out ${
            isMobileOpen ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'
          }`}
        >
          <nav aria-label="主导航" className="px-3 py-3">
            <ul className="space-y-0.5">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentPath === tab.path;
                return (
                  <li key={tab.path}>
                    <button
                      type="button"
                      onClick={() => handleMobileNavigate(tab.path)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                        isActive ? 'bg-accent-soft/40 text-accent' : 'text-muted hover:text-text hover:bg-surface'
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.8} />
                      <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>{tab.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>

      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-text/20 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
          role="button"
          tabIndex={-1}
          aria-label="关闭遮罩"
        />
      )}
    </>
  );
};

export default Sidebar;
