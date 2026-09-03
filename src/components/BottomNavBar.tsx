import React from 'react';
import { LayoutDashboard, Target, CreditCard, HandCoins, Calendar } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isDark?: boolean;
}

interface NavTabItem {
  id: TabType;
  label: string;
  icon: React.FC<{ className?: string }>;
  activeBg: string;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  isDark = false,
}) => {
  const tabs: NavTabItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      activeBg: 'bg-emerald-500 text-slate-950',
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: Target,
      activeBg: 'bg-emerald-500 text-slate-950',
    },
    {
      id: 'debts',
      label: 'Debts',
      icon: CreditCard,
      activeBg: 'bg-indigo-500 text-white',
    },
    {
      id: 'held',
      label: 'Money Held',
      icon: HandCoins,
      activeBg: 'bg-indigo-500 text-white',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      activeBg: 'bg-emerald-500 text-slate-950',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-900/95 border-t border-slate-800 text-white shadow-2xl transition-colors">
      <div className="max-w-md mx-auto px-2 sm:px-4 h-16 flex items-center justify-around space-x-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              title={tab.label}
              className={`flex items-center transition-all duration-200 cursor-pointer ${
                isActive
                  ? `${tab.activeBg} px-3 py-2 rounded-full shadow-md scale-105 font-extrabold space-x-1.5`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 p-2.5 rounded-full'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {isActive && (
                <span className="text-xs font-bold whitespace-nowrap animate-in fade-in duration-150">
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};


