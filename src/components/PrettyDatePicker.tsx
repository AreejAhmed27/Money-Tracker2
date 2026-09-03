import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, RotateCcw, X } from 'lucide-react';
import { getTodayDateString } from '../utils/formatters';

interface PrettyDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  isDark?: boolean;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const PrettyDatePicker: React.FC<PrettyDatePickerProps> = ({
  value,
  onChange,
  isDark = false,
  placeholder = 'Select date...',
  className = 'w-full',
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial value or default to today for viewing month/year
  const parsedDate = value ? new Date(value + 'T00:00:00') : new Date();
  const initialYear = isNaN(parsedDate.getFullYear()) ? new Date().getFullYear() : parsedDate.getFullYear();
  const initialMonth = isNaN(parsedDate.getMonth()) ? new Date().getMonth() : parsedDate.getMonth();

  const [viewYear, setViewYear] = useState<number>(initialYear);
  const [viewMonth, setViewMonth] = useState<number>(initialMonth);

  // Sync view when value changes from outside
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format date for display button (e.g. "Aug 9, 2026" or "2026-08-09")
  const formatDisplayValue = (dateStr: string) => {
    if (!dateStr) return placeholder;
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    
    // Return e.g. "Aug 9, 2026" or "2026-08-09"
    const m = MONTH_NAMES[d.getMonth()].substring(0, 3);
    const day = d.getDate();
    const yr = d.getFullYear();
    return `${m} ${day}, ${yr}`;
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day: number, monthOffset: number = 0) => {
    let targetYear = viewYear;
    let targetMonth = viewMonth + monthOffset;

    if (targetMonth < 0) {
      targetMonth = 11;
      targetYear -= 1;
    } else if (targetMonth > 11) {
      targetMonth = 0;
      targetYear += 1;
    }

    const mm = String(targetMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const selectedStr = `${targetYear}-${mm}-${dd}`;

    onChange(selectedStr);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const todayStr = getTodayDateString();
    onChange(todayStr);
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  // Generate Calendar Grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const prevMonthDaysToShow = firstDayOfWeek;
  const calendarCells = [];

  // Previous month trailing days
  for (let i = prevMonthDaysToShow - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      monthOffset: -1,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      day: i,
      monthOffset: 0,
      isCurrentMonth: true,
    });
  }

  // Next month leading days (to complete 35 or 42 cells)
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({
      day: i,
      monthOffset: 1,
      isCurrentMonth: false,
    });
  }

  const todayStr = getTodayDateString();

  const sizeClasses =
    size === 'sm'
      ? 'px-3 py-1.5 text-xs rounded-xl'
      : size === 'lg'
      ? 'px-4 py-3 text-sm rounded-2xl'
      : 'px-3.5 py-2.5 text-xs sm:text-sm rounded-xl';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 border font-mono font-extrabold cursor-pointer transition shadow-xs select-none ${sizeClasses} ${
          isDark
            ? 'bg-slate-800/90 border-slate-700/90 text-white hover:bg-slate-800 hover:border-emerald-500/50'
            : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50 hover:border-emerald-500/50'
        }`}
      >
        <div className="flex items-center space-x-2 min-w-0 pr-1 truncate">
          <CalendarIcon className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="truncate">{formatDisplayValue(value)}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-500' : ''
          }`}
        />
      </button>

      {/* Custom Floating Calendar Popover Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[250] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
          {/* Backdrop click to close */}
          <div
            className="absolute inset-0"
            onClick={() => setIsOpen(false)}
          />

          <div
            className={`relative z-10 w-full max-w-xs sm:max-w-sm rounded-2xl border shadow-2xl p-4 space-y-3 animate-in zoom-in-95 duration-150 ${
              isDark
                ? 'bg-slate-900 border-slate-700/80 text-white shadow-emerald-950/20'
                : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
            }`}
          >
            {/* Header: Title & Close */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/40">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Select Date
                  </h4>
                  <p className="text-sm font-black font-mono">
                    {value ? formatDisplayValue(value) : 'No date selected'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`p-1.5 rounded-xl cursor-pointer transition ${
                  isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Month / Year Header Navigation */}
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className={`p-2 rounded-xl cursor-pointer transition ${
                  isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-sm font-black tracking-wide font-mono">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className={`p-2 rounded-xl cursor-pointer transition ${
                  isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAYS.map((wd) => (
                <span
                  key={wd}
                  className={`text-[11px] font-black uppercase tracking-wider py-1 ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {wd}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {calendarCells.map((cell, idx) => {
                let cellYear = viewYear;
                let cellMonth = viewMonth + cell.monthOffset;
                if (cellMonth < 0) {
                  cellMonth = 11;
                  cellYear -= 1;
                } else if (cellMonth > 11) {
                  cellMonth = 0;
                  cellYear += 1;
                }

                const cellDateStr = `${cellYear}-${String(cellMonth + 1).padStart(2, '0')}-${String(
                  cell.day
                ).padStart(2, '0')}`;

                const isSelected = cellDateStr === value;
                const isToday = cellDateStr === todayStr;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDay(cell.day, cell.monthOffset)}
                    className={`h-9 rounded-xl text-xs font-mono font-extrabold flex items-center justify-center transition cursor-pointer relative ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-black shadow-lg scale-105 z-10'
                        : !cell.isCurrentMonth
                        ? isDark
                          ? 'text-slate-600 hover:bg-slate-800/40 hover:text-slate-400'
                          : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'
                        : isDark
                        ? 'text-slate-200 hover:bg-slate-800 hover:text-white'
                        : 'text-slate-800 hover:bg-slate-100'
                    } ${isToday && !isSelected ? 'border border-emerald-500/60 font-black' : ''}`}
                  >
                    <span>{cell.day}</span>
                    {isToday && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer Bar: Today & Quick Controls */}
            <div
              className={`flex items-center justify-between pt-3 border-t text-xs ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={handleSelectToday}
                className="text-emerald-500 hover:text-emerald-400 font-extrabold flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-lg hover:bg-emerald-500/10 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Select Today</span>
              </button>

              <div className="flex items-center space-x-2">
                {value && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange('');
                      setIsOpen(false);
                    }}
                    className={`px-2.5 py-1 font-semibold rounded-lg cursor-pointer transition ${
                      isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-lg text-xs cursor-pointer transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
