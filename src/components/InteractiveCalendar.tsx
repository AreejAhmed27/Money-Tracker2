import React from 'react';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { AssetItem, ExpenseItem, MonthMetrics } from '../types';
import {
  formatCurrency,
  formatCompactCurrency,
  MONTH_NAMES,
} from '../utils/formatters';
import { PrettySelect } from './PrettySelect';

interface InteractiveCalendarProps {
  expenses: ExpenseItem[];
  assets: AssetItem[];
  activeMonth: string;
  activeYear: number;
  availableYears?: number[];
  currencyCode?: string;
  isDark?: boolean;
  onMonthChange: (month: string) => void;
  onYearChange?: (year: number) => void;
  monthlyChain: MonthMetrics[];
  onSelectDay: (dateStr: string) => void;
}

export const InteractiveCalendar: React.FC<InteractiveCalendarProps> = ({
  expenses,
  assets,
  activeMonth,
  activeYear,
  availableYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030],
  currencyCode = 'EGP',
  isDark = false,
  onMonthChange,
  onYearChange,
  monthlyChain,
  onSelectDay,
}) => {
  const monthIdx = MONTH_NAMES.indexOf(activeMonth);
  const currentMonthIdx = monthIdx >= 0 ? monthIdx : 0;

  const daysInMonth = new Date(activeYear, currentMonthIdx + 1, 0).getDate();
  const firstDayOfWeek = new Date(activeYear, currentMonthIdx, 1).getDay();

  const monthMetrics = monthlyChain.find(
    (m) => m.month_name.toLowerCase() === activeMonth.toLowerCase()
  ) || {
    starting_balance: 0,
    total_expenses: 0,
    ending_balance: 0,
  };

  const dailySpendMap: Record<number, number> = {};
  expenses.forEach((e) => {
    if (e.month_name.toLowerCase() === activeMonth.toLowerCase() && e.year === activeYear) {
      const dayNum = parseInt(e.entry_date.split('-')[2], 10);
      if (!isNaN(dayNum)) {
        dailySpendMap[dayNum] = (dailySpendMap[dayNum] || 0) + Number(e.amount);
      }
    }
  });

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  const cardBg = isDark
    ? 'bg-slate-900 border-slate-800 text-white'
    : 'bg-white border-slate-200/80 text-slate-900';

  return (
    <div className={`${cardBg} rounded-2xl p-4 sm:p-5 border shadow-sm space-y-4`}>
      {/* Calendar Month & Year Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div className="flex items-center space-x-2">
            {/* Pretty Month Dropdown Menu */}
            <PrettySelect
              value={activeMonth}
              isDark={isDark}
              options={MONTH_NAMES.map((m) => ({ value: m, label: m }))}
              onChange={(m) => onMonthChange(m)}
              size="sm"
            />

            {/* Pretty Year Dropdown Menu */}
            <PrettySelect
              value={activeYear}
              isDark={isDark}
              options={availableYears.map((yr) => ({ value: yr, label: String(yr) }))}
              onChange={(yr) => onYearChange && onYearChange(yr)}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className={`grid grid-cols-7 gap-1 text-center border-b pb-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid - Clean Numbers Only */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {calendarCells.map((dayNum, idx) => {
          if (dayNum === null) {
            return <div key={`empty-${idx}`} className={`h-11 sm:h-14 rounded-xl ${isDark ? 'bg-slate-800/20' : 'bg-slate-50/50'}`} />;
          }

          const daySpend = dailySpendMap[dayNum] || 0;
          const formattedDateStr = `${activeYear}-${String(currentMonthIdx + 1).padStart(2, '0')}-${String(
            dayNum
          ).padStart(2, '0')}`;

          const isHighSpend = daySpend >= 1000;

          return (
            <button
              key={`day-${dayNum}`}
              type="button"
              onClick={() => onSelectDay(formattedDateStr)}
              className={`h-11 sm:h-14 rounded-xl border flex flex-col items-center justify-center relative transition cursor-pointer active:scale-95 group ${
                daySpend > 0
                  ? isHighSpend
                    ? 'bg-red-500/10 border-red-500/40 text-red-500 font-black hover:bg-red-500/20'
                    : 'bg-amber-500/10 border-amber-500/40 text-amber-500 font-extrabold hover:bg-amber-500/20'
                  : isDark
                  ? 'bg-slate-800/40 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-800 font-bold'
                  : 'bg-white border-slate-200/70 text-slate-800 hover:border-slate-300 hover:bg-slate-50 font-bold'
              }`}
            >
              {/* Clean Day Number */}
              <span className="text-sm sm:text-base font-mono tracking-tight">{dayNum}</span>

              {/* Optional subtle dot indicator if spend exists */}
              {daySpend > 0 && (
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                    isHighSpend ? 'bg-red-500' : 'bg-amber-500'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Month Summary Strip */}
      <div className={`mt-4 pt-4 border-t rounded-xl p-3.5 flex items-center justify-between text-xs sm:text-sm ${
        isDark ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50/90'
      }`}>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">STARTING BALANCE</span>
          <span className={`font-bold font-mono ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {formatCurrency(monthMetrics.starting_balance, currencyCode)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">TOTAL SPENT</span>
          <span className="font-bold text-red-500 font-mono">
            -{formatCurrency(monthMetrics.total_expenses, currencyCode)}
          </span>
        </div>
      </div>
    </div>
  );
};

