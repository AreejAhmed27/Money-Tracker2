import React, { useEffect, useRef } from 'react';
import { MonthMetrics } from '../types';
import { formatCompactCurrency, MONTH_NAMES } from '../utils/formatters';
import { Calendar } from 'lucide-react';

interface BarChartProps {
  monthlyChain: MonthMetrics[];
  activeMonth: string;
  activeYear: number;
  currencyCode?: string;
  isDark?: boolean;
  onSelectMonth: (monthName: string) => void;
  onShowActive?: () => void;
  resetTrigger?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  monthlyChain,
  activeMonth,
  activeYear,
  currencyCode = 'EGP',
  isDark = false,
  onSelectMonth,
  onShowActive,
  resetTrigger,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeMonthBarRef = useRef<HTMLDivElement>(null);
  const selectedBarRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const todayMonthName = MONTH_NAMES[now.getMonth()];
  const todayYear = now.getFullYear();
  const isCurrentYear = activeYear === todayYear;

  const isViewingCurrentMonth = isCurrentYear && activeMonth.toLowerCase() === todayMonthName.toLowerCase();

  const maxExpenses = Math.max(
    ...monthlyChain.map((m) => m.total_expenses),
    10000
  );

  const cardBg = isDark
    ? 'bg-slate-900 border-slate-800 text-white'
    : 'bg-white border-slate-200/80 text-slate-900';

  const scrollToActive = (behavior: ScrollBehavior = 'smooth') => {
    if (activeMonthBarRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const target = activeMonthBarRef.current;
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const relativeLeft = targetRect.left - containerRect.left + container.scrollLeft;
      const targetScroll = relativeLeft - container.clientWidth / 2 + target.clientWidth / 2;
      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior,
      });
    }
  };

  // Focus horizontally on the active month (today's month) on initial load or when returning to dashboard
  useEffect(() => {
    if (activeMonthBarRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const target = activeMonthBarRef.current;
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const relativeLeft = targetRect.left - containerRect.left + container.scrollLeft;
      const targetScroll = relativeLeft - container.clientWidth / 2 + target.clientWidth / 2;
      container.scrollLeft = Math.max(0, targetScroll);
    }
  }, [resetTrigger]);

  const handleShowActiveClick = () => {
    if (onShowActive) {
      onShowActive();
    } else {
      onSelectMonth(todayMonthName);
    }
    setTimeout(() => {
      scrollToActive('smooth');
    }, 50);
  };

  return (
    <div className={`${cardBg} rounded-2xl p-4 sm:p-5 border shadow-sm`}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold">Monthly Comparison</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active: '{todayMonthName}'
            </span>
          </div>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>
            Burn rate & spend comparison ({activeYear})
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isViewingCurrentMonth && (
            <button
              type="button"
              onClick={handleShowActiveClick}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isDark
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 active:scale-95'
              }`}
              title={`Show active month (${todayMonthName}) in chart`}
            >
              <Calendar className="w-3 h-3" />
              <span>Show Active</span>
            </button>
          )}

          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
            isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
          }`}>
            {currencyCode} / Month
          </span>
        </div>
      </div>

      <div ref={scrollContainerRef} className="pt-4 pb-2 overflow-x-auto scrollbar-thin">
        <div className="flex items-end gap-2 sm:gap-3 min-w-[540px] h-48 border-b pb-1 border-slate-200 dark:border-slate-800">
          {monthlyChain.map((item) => {
            const isTodayMonth = item.month_name.toLowerCase() === todayMonthName.toLowerCase() && isCurrentYear;
            const isSelected = item.month_name.toLowerCase() === activeMonth.toLowerCase();
            const heightPercent = Math.max(
              (item.total_expenses / maxExpenses) * 100,
              6
            );

            return (
              <div
                key={item.month_name}
                ref={isTodayMonth ? activeMonthBarRef : isSelected ? selectedBarRef : null}
                onClick={() => onSelectMonth(item.month_name)}
                className={`flex-1 flex flex-col items-center group cursor-pointer h-full justify-end px-1 rounded-xl transition-all ${
                  isTodayMonth
                    ? isDark
                      ? 'bg-emerald-950/20 ring-1 ring-emerald-500/30'
                      : 'bg-emerald-50/60 ring-1 ring-emerald-500/30'
                    : isSelected
                    ? isDark
                      ? 'bg-slate-800/40'
                      : 'bg-slate-100/60'
                    : ''
                }`}
              >
                {/* Active Pill Tag - ONLY for the current month of today's date */}
                {isTodayMonth ? (
                  <span className="mb-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs scale-90 whitespace-nowrap">
                    Active
                  </span>
                ) : (
                  <span className="mb-1 h-4 block" />
                )}

                {/* Amount Label above Bar */}
                <span
                  className={`text-[9px] sm:text-[10px] font-bold font-mono mb-1.5 transition ${
                    isTodayMonth
                      ? isDark ? 'text-emerald-400 scale-105 font-extrabold' : 'text-emerald-700 scale-105 font-extrabold'
                      : isSelected
                      ? isDark ? 'text-slate-200 font-bold' : 'text-slate-900 font-bold'
                      : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                >
                  {item.total_expenses > 0 ? formatCompactCurrency(item.total_expenses, currencyCode) : '-'}
                </span>

                {/* Vertical Bar */}
                <div className={`w-full max-w-[28px] rounded-t-xl overflow-hidden flex items-end relative h-28 ${
                  isTodayMonth
                    ? isDark ? 'bg-slate-800/90 ring-1 ring-emerald-500/40' : 'bg-emerald-100/60 ring-1 ring-emerald-400/50'
                    : isDark ? 'bg-slate-800' : 'bg-slate-100'
                }`}>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-xl transition-all duration-300 ${
                      isTodayMonth
                        ? 'bg-emerald-500 shadow-md'
                        : isSelected
                        ? isDark ? 'bg-slate-500 shadow-sm' : 'bg-slate-700 shadow-sm'
                        : isDark ? 'bg-slate-700 group-hover:bg-slate-600' : 'bg-slate-300 group-hover:bg-slate-400'
                    }`}
                  />
                </div>

                {/* Month Name Label below Bar */}
                <div className="mt-2 flex flex-col items-center pb-0.5">
                  <span
                    className={`text-[11px] font-bold transition flex items-center gap-0.5 ${
                      isTodayMonth
                        ? isDark
                          ? 'text-emerald-400 border-b-2 border-emerald-400 pb-0.5 font-extrabold'
                          : 'text-emerald-700 border-b-2 border-emerald-600 pb-0.5 font-extrabold'
                        : isSelected
                        ? isDark
                          ? 'text-slate-200 border-b-2 border-slate-400 pb-0.5 font-bold'
                          : 'text-slate-900 border-b-2 border-slate-800 pb-0.5 font-bold'
                        : isDark
                        ? 'text-slate-400 group-hover:text-slate-200'
                        : 'text-slate-500 group-hover:text-slate-800'
                    }`}
                  >
                    {item.month_name.substring(0, 3)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

