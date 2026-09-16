import React, { useEffect, useState } from 'react';
import {
  Home,
  LayoutGrid,
  SquarePen,
  Clock,
  Star,
  Settings,
  Moon,
  Sun,
  ChevronsLeft,
  ChevronsRight,
  Image as ImageIcon,
} from 'lucide-react';
import { NavPage } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { BrandingSettings, loadBrandingSettings, BrandingSettingsData } from './BrandingSettings';

interface SidebarProps {
  currentPage: NavPage;
  onSelectPage: (page: NavPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  compact?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  collapsed,
  onToggleCollapse,
  darkMode,
  onToggleDarkMode,
  compact = false,
}) => {
  const [branding, setBranding] = useState<BrandingSettingsData>(loadBrandingSettings);
  const [showBrandingSettings, setShowBrandingSettings] = useState(false);

  useEffect(() => {
    const refreshBranding = () => setBranding(loadBrandingSettings());
    window.addEventListener('ns-branding-updated', refreshBranding);
    return () => window.removeEventListener('ns-branding-updated', refreshBranding);
  }, []);

  const navItems = [
    { id: 'dashboard' as NavPage, label: 'Dashboard', icon: Home },
    { id: 'subjects' as NavPage, label: 'Subjects', icon: LayoutGrid },
    { id: 'notes' as NavPage, label: 'Notes', icon: SquarePen },
    { id: 'recent' as NavPage, label: 'Recent', icon: Clock },
    { id: 'favorites' as NavPage, label: 'Favorites', icon: Star },
    { id: 'settings' as NavPage, label: 'Settings', icon: Settings },
  ];

  const logo = branding.dataUrl;
  const logoSize = branding.size;

  const brandText = branding.showName ? (
    <span className="text-[21px] font-bold tracking-tight whitespace-nowrap">
      <span className={darkMode ? 'text-white' : 'text-gray-900'}>Note</span>
      <span className="text-[#7F56D9]">Storage</span>
    </span>
  ) : null;

  const customBrand = logo ? (
    <div className="flex items-center gap-2 min-w-0">
      {branding.position === 'left' && (
        <img src={logo} alt="Custom NoteStorage logo" style={{ width: logoSize, height: logoSize }} className="object-contain shrink-0" />
      )}
      {branding.position === 'replace' ? (
        <img src={logo} alt="Custom NoteStorage logo" style={{ width: logoSize, height: logoSize }} className="object-contain shrink-0" />
      ) : brandText}
      {branding.position === 'right' && (
        <img src={logo} alt="Custom NoteStorage logo" style={{ width: logoSize, height: logoSize }} className="object-contain shrink-0" />
      )}
    </div>
  ) : brandText;

  return (
    <aside
      className={`relative flex flex-col border-r transition-all duration-200 select-none ${
        darkMode
          ? 'bg-[#18181b] border-zinc-800 text-zinc-200'
          : 'bg-white border-[#EAECF0] text-gray-700'
      } ${collapsed ? 'w-[70px] px-2' : 'w-[230px] px-3.5'} ${compact ? 'py-3' : 'py-5'} flex-shrink-0 min-h-screen`}
    >
      {/* Brand Header */}
      <div className={`flex items-center justify-between ${compact ? 'mb-4' : 'mb-7'} px-1.5`}>
        {!collapsed ? (
          branding.dataUrl ? customBrand : (
            <div className="flex items-center">
              <span
                className={`text-[21px] font-bold tracking-tight ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Note
              </span>
              <span className="text-[21px] font-bold tracking-tight text-[#7F56D9]">
                Storage
              </span>
            </div>
          )
        ) : (
          branding.dataUrl ? (
            <img src={branding.dataUrl} alt="Custom NoteStorage logo" style={{ width: Math.min(branding.size, 40), height: Math.min(branding.size, 40) }} className="mx-auto object-contain" />
          ) : (
            <div className="mx-auto text-[20px] font-bold text-[#7F56D9]">NS</div>
          )
        )}

        <button
          id="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`p-1 rounded-lg border transition-colors ${
            darkMode
              ? 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'
              : 'border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          } ${collapsed ? 'mx-auto' : ''}`}
        >
          {collapsed ? (
            <ChevronsRight className="w-4 h-4" />
          ) : (
            <ChevronsLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onSelectPage(item.id)}
              className={`flex items-center gap-3 px-3 ${compact ? 'py-1.5' : 'py-2'} rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? darkMode
                    ? 'bg-[#27272a] text-[#c084fc]'
                    : 'bg-[#F9F5FF] text-[#6941C6]'
                  : darkMode
                  ? 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-[19px] h-[19px] flex-shrink-0 ${
                  isActive
                    ? darkMode
                      ? 'text-[#c084fc]'
                      : 'text-[#6941C6]'
                    : darkMode
                    ? 'text-zinc-400'
                    : 'text-gray-500'
                }`}
                strokeWidth={isActive ? 2 : 1.75}
              />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}

        {/* Branding is available from Settings, matching the existing settings-sidebar pattern. */}
        {currentPage === 'settings' && (
          <button
            id="nav-item-branding"
            onClick={() => setShowBrandingSettings(true)}
            className={`flex items-center gap-3 px-3 ${compact ? 'py-1.5' : 'py-2'} rounded-xl text-sm font-medium transition-all ${
              darkMode
                ? 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            } ${collapsed ? 'justify-center px-2' : ''}`}
            title="Logo & Branding"
          >
            <ImageIcon className="w-[19px] h-[19px] flex-shrink-0 text-[#7F56D9]" strokeWidth={1.75} />
            {!collapsed && <span>Logo & Branding</span>}
          </button>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-2">
        {!collapsed && (
          <div className="px-1">
            <PWAInstallButton variant="sidebar" darkMode={darkMode} />
          </div>
        )}

        <button
          id="theme-toggle-btn"
          onClick={onToggleDarkMode}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            darkMode
              ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          } ${collapsed ? 'justify-center px-2' : ''}`}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            <Sun className="w-[19px] h-[19px] text-amber-400 flex-shrink-0" strokeWidth={1.75} />
          ) : (
            <Moon className="w-[19px] h-[19px] text-gray-500 flex-shrink-0" strokeWidth={1.75} />
          )}
          {!collapsed && <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>}
        </button>
      </div>

      {showBrandingSettings && (
        <BrandingSettings
          darkMode={darkMode}
          onClose={() => {
            setBranding(loadBrandingSettings());
            setShowBrandingSettings(false);
          }}
        />
      )}
    </aside>
  );
};
