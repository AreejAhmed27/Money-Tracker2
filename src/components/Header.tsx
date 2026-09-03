import React from 'react';
import { Download, Calendar, Wallet, User, Moon, Sun, HelpCircle } from 'lucide-react';
import { MONTH_NAMES } from '../utils/formatters';
import { TabType, UserAccount } from '../types';

interface HeaderProps {
  activeMonth: string;
  activeYear: number;
  availableYears: number[];
  onMonthChange: (month: string) => void;
  onYearChange: (year: number) => void;
  currencyCode: string;
  activeTrackerName?: string;
  userAccount?: UserAccount | null;
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  onOpenReportModal?: () => void;
  onOpenReports?: () => void;
  onOpenSettings?: () => void;
  onOpenCategories?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  onOpenTutorial?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeMonth,
  activeYear,
  availableYears,
  onMonthChange,
  onYearChange,
  currencyCode,
  activeTrackerName,
  userAccount,
  activeTab = 'dashboard',
  onTabChange,
  onOpenReportModal,
  onOpenReports,
  onOpenSettings,
  onOpenCategories,
  isDark = false,
  onToggleTheme,
  onOpenTutorial,
}) => {
  const handleNavToSettings = () => {
    if (onTabChange) onTabChange('settings');
    else if (onOpenSettings) onOpenSettings();
  };

  return (
    <header className="sticky top-0 z-20 bg-slate-900 text-white shadow-md border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Left Column: Brand */}
        <div className="flex flex-col">
          <div
            className="flex items-center space-x-2.5 cursor-pointer group"
            onClick={onOpenCategories || (() => onTabChange?.('dashboard'))}
            title="Click to open sidebar & switch currency trackers"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/30 transition">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white leading-tight flex items-center gap-1.5">
                <span>{activeTrackerName || 'Money Tracker'}</span>
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-black uppercase border border-emerald-500/30">
                  {currencyCode}
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <span>Sidebar / Trackers</span>
                <span>•</span>
                <span>{userAccount?.name || 'Areej Ahmed'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* How to Use / Tutorial Button */}
          {onOpenTutorial && (
            <button
              onClick={onOpenTutorial}
              title="How to Use App Guide"
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center transition cursor-pointer active:scale-95 text-emerald-400"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}

          {/* Moon / Sun Theme Switcher Toggle */}
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center transition cursor-pointer active:scale-95"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          {/* User Icon / Avatar Settings Access */}
          <button
            onClick={handleNavToSettings}
            title="User Account & Settings"
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition overflow-hidden ${
              activeTab === 'settings'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 ring-2 ring-emerald-500/40'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            {userAccount?.avatarUrl ? (
              <img
                src={userAccount.avatarUrl}
                alt={userAccount.name || 'User Profile'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-emerald-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};


