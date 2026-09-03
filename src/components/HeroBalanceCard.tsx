import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Calendar,
  Download,
  Plus,
  Minus,
  X,
  Check,
  HandCoins,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency, MONTH_NAMES } from '../utils/formatters';
import { PrettySelect } from './PrettySelect';

interface HeroBalanceCardProps {
  currentBalance: number;
  totalHeldMoney?: number;
  activeMonth: string;
  activeYear: number;
  availableYears?: number[];
  carriedFromPrevMonth: number;
  totalAssets: number;
  totalExpenses: number;
  currencyCode?: string;
  isDark?: boolean;
  onMonthChange?: (month: string) => void;
  onYearChange?: (year: number) => void;
  onOpenAddFunds?: () => void;
  onOpenLogExpense?: () => void;
  onDownloadReport?: () => void;
  onNavToHeldMoney?: () => void;
}

export const HeroBalanceCard: React.FC<HeroBalanceCardProps> = ({
  currentBalance,
  totalHeldMoney = 0,
  activeMonth,
  activeYear,
  availableYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030],
  carriedFromPrevMonth,
  totalAssets,
  totalExpenses,
  currencyCode = 'EGP',
  onMonthChange,
  onYearChange,
  onOpenAddFunds,
  onOpenLogExpense,
  onDownloadReport,
  onNavToHeldMoney,
}) => {
  const isNegative = currentBalance < 0;
  const isLow = currentBalance >= 0 && currentBalance < 1000;
  const ownedNetBalance = currentBalance - totalHeldMoney;

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [tempMonth, setTempMonth] = useState<string>(activeMonth);
  const [tempYear, setTempYear] = useState<number>(activeYear);

  // Helper to compute max days in selected month and year
  const getDaysInSelectedMonth = (monthName: string, year: number) => {
    const mIndex = MONTH_NAMES.findIndex((m) => m.toLowerCase() === monthName.toLowerCase());
    if (mIndex === -1) return 31;
    return new Date(year, mIndex + 1, 0).getDate();
  };

  const maxDays = getDaysInSelectedMonth(tempMonth, tempYear);

  const handleApplyDate = () => {
    if (onMonthChange) onMonthChange(tempMonth);
    if (onYearChange) onYearChange(tempYear);
    setIsDatePickerOpen(false);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-5 sm:p-6 shadow-xl border border-slate-800">
      {/* Background Decorative Accent */}
      <div
        className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500 ${
          isNegative ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
        }`}
      />

      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              CURRENT NET BALANCE
            </span>
          </div>

          {/* Date Selector Trigger Button */}
          <button
            onClick={() => {
              setTempMonth(activeMonth);
              setTempYear(activeYear);
              setIsDatePickerOpen(true);
            }}
            className="flex items-center space-x-1.5 text-xs font-bold text-emerald-300 bg-slate-800/90 hover:bg-slate-700/90 px-3 py-1.5 rounded-xl border border-emerald-500/30 transition shadow-xs cursor-pointer"
            title="Click to change date (Month, Year, Day)"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{activeMonth} {activeYear}</span>
          </button>
        </div>

        {/* Big Balance Display */}
        <div className="my-2">
          <div
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-mono transition-colors ${
              isNegative ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {formatCurrency(currentBalance, currencyCode)}
          </div>

          {/* Non-owned Money Held breakdown banner */}
          <div
            onClick={onNavToHeldMoney}
            className={`mt-3 p-2.5 sm:p-3 rounded-xl border flex items-center justify-between text-xs transition cursor-pointer ${
              totalHeldMoney > 0
                ? 'bg-indigo-950/70 border-indigo-700/60 text-white hover:bg-indigo-900/80 shadow-xs'
                : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/70'
            }`}
            title="Click to view Money Held for Others tab"
          >
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <HandCoins className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider block">
                  MONEY HELD
                </span>
                <span className="text-xs font-extrabold font-mono text-indigo-200">
                  {formatCurrency(totalHeldMoney, currencyCode)}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Your Owned Balance
              </span>
              <span className="text-xs font-bold font-mono text-emerald-400">
                {formatCurrency(ownedNetBalance, currencyCode)}
              </span>
            </div>
          </div>

          {/* Subtext: Carryover details */}
          <div className="mt-2.5 flex items-center text-xs font-medium text-slate-400 gap-1.5">
            <span className="text-slate-500">▸</span>
            <span>
              Carried starting balance:{' '}
              <strong className="text-slate-200">{formatCurrency(carriedFromPrevMonth, currencyCode)}</strong>
            </span>
          </div>
        </div>

        {/* Mini stats bar */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center space-x-2 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400">Total Funds</p>
              <p className="text-xs font-bold text-slate-200">{formatCurrency(totalAssets, currencyCode)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400">Total Expenses</p>
              <p className="text-xs font-bold text-slate-200">{formatCurrency(totalExpenses, currencyCode)}</p>
            </div>
          </div>
        </div>

        {/* Action Button: Download Financial Report */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <button
            onClick={onDownloadReport}
            className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition shadow-md cursor-pointer active:scale-[0.99]"
          >
            <Download className="w-4 h-4" />
            <span>Download Financial Report</span>
          </button>
        </div>
      </div>

      {/* Date Picker Modal */}
      {isDatePickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-white space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold">Select Active Date</h3>
              </div>
              <button
                onClick={() => setIsDatePickerOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Select Month */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Select Month
              </label>
              <PrettySelect
                value={tempMonth}
                isDark={true}
                options={MONTH_NAMES.map((m) => ({ value: m, label: m }))}
                onChange={(newM) => {
                  setTempMonth(newM);
                  const mDays = getDaysInSelectedMonth(newM, tempYear);
                  if (selectedDay > mDays) setSelectedDay(mDays);
                }}
              />
            </div>

            {/* Select Year */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Select Year
              </label>
              <PrettySelect
                value={tempYear}
                isDark={true}
                options={availableYears.map((yr) => ({ value: yr, label: String(yr) }))}
                onChange={(newYr) => {
                  setTempYear(newYr);
                  const mDays = getDaysInSelectedMonth(tempMonth, newYr);
                  if (selectedDay > mDays) setSelectedDay(mDays);
                }}
              />
            </div>

            {/* Select Day */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Select Day ({maxDays} Days)
              </label>
              <PrettySelect
                value={selectedDay > maxDays ? maxDays : selectedDay}
                isDark={true}
                options={Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => ({
                  value: d,
                  label: `Day ${d}`,
                }))}
                onChange={(d) => setSelectedDay(d)}
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyDate}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Date</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
