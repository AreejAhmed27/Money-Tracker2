import React from 'react';
import { CalendarDays, Calendar, TrendingDown, PiggyBank, HandCoins } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface MetricCardsProps {
  todaySpend: number;
  monthlySpend: number;
  ytdSpend: number;
  monthlySavings: number;
  totalHeldMoney?: number;
  activeMonth: string;
  activeYear: number;
  currencyCode?: string;
  isDark?: boolean;
  onNavToHeldMoney?: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  todaySpend,
  monthlySpend,
  ytdSpend,
  monthlySavings,
  totalHeldMoney = 0,
  activeMonth,
  activeYear,
  currencyCode = 'EGP',
  isDark = false,
  onNavToHeldMoney,
}) => {
  const cardBg = isDark
    ? 'bg-slate-900 border-slate-800 text-white shadow-sm'
    : 'bg-white border-slate-200/80 text-slate-900 shadow-sm';

  const subText = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-3">
      {/* 2 Metric Cards side by side */}
      <div className="grid grid-cols-2 gap-3">
        {/* TODAY'S SPEND */}
        <div className={`${cardBg} rounded-2xl p-4 border flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${subText}`}>
              TODAY'S SPEND
            </span>
            <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono">
              {formatCurrency(todaySpend, currencyCode)}
            </div>
            <p className={`text-[11px] ${subText} mt-0.5`}>Logged for today</p>
          </div>
        </div>

        {/* MONTHLY SPEND */}
        <div className={`${cardBg} rounded-2xl p-4 border flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${subText}`}>
              MONTHLY SPEND
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono">
              {formatCurrency(monthlySpend, currencyCode)}
            </div>
            <p className={`text-[11px] ${subText} mt-0.5`}>In {activeMonth} {activeYear}</p>
          </div>
        </div>
      </div>

      {/* Wide Metric Card: Year-To-Date & Savings */}
      <div className={`${cardBg} rounded-2xl p-4 border flex items-center justify-between gap-3 flex-wrap`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${subText} block`}>
              YEAR-TO-DATE SUMMARY ({activeYear})
            </span>
            <span className="text-base font-bold font-mono">
              {formatCurrency(ytdSpend, currencyCode)} <span className={`text-xs font-normal ${subText}`}>total spent</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Money Held Badge */}
          {totalHeldMoney > 0 && (
            <button
              onClick={onNavToHeldMoney}
              className="text-right text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/60 inline-flex items-center gap-1.5 hover:opacity-90 cursor-pointer"
              title="Money held for others (not owned)"
            >
              <HandCoins className="w-3.5 h-3.5" />
              <span>Held: {formatCurrency(totalHeldMoney, currencyCode)}</span>
            </button>
          )}

          {/* Monthly Savings Badge */}
          <div className="text-right hidden sm:block">
            <span className={`text-[10px] uppercase font-bold ${subText} block`}>SAVINGS SET ASIDE</span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/60 inline-flex items-center gap-1">
              <PiggyBank className="w-3.5 h-3.5" />
              {formatCurrency(monthlySavings, currencyCode)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

