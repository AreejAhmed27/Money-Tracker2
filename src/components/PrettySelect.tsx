import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface PrettySelectOption<T extends string | number = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  symbol?: string;
  color?: string;
  description?: string;
}

interface PrettySelectProps<T extends string | number = string> {
  value: T;
  options: PrettySelectOption<T>[];
  onChange: (value: T) => void;
  isDark?: boolean;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PrettySelect<T extends string | number = string>({
  value,
  options,
  onChange,
  isDark = false,
  placeholder = 'Select option',
  className = 'w-full',
  buttonClassName = '',
  size = 'md',
}: PrettySelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizeClasses =
    size === 'sm'
      ? 'px-3 py-1.5 text-xs rounded-xl'
      : size === 'lg'
      ? 'px-4 py-3 text-sm rounded-2xl'
      : 'px-3.5 py-2.5 text-xs sm:text-sm rounded-xl';

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 border font-extrabold cursor-pointer transition shadow-xs select-none ${sizeClasses} ${
          isDark
            ? 'bg-slate-800/90 border-slate-700/90 text-white hover:bg-slate-800 hover:border-emerald-500/50'
            : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50 hover:border-emerald-500/50'
        } ${buttonClassName}`}
      >
        <div className="flex items-center space-x-2 min-w-0 pr-1 truncate">
          {selectedOption?.color && (
            <span
              className="w-3 h-3 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: selectedOption.color }}
            />
          )}
          {selectedOption?.symbol && (
            <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-500 text-[11px] font-black flex items-center justify-center shrink-0">
              {selectedOption.symbol}
            </span>
          )}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate">{selectedOption?.label || placeholder}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-emerald-500 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 scale-110' : ''
          }`}
        />
      </button>

      {/* Floating Options Panel */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border shadow-2xl p-1.5 max-h-60 overflow-y-auto min-w-[160px] animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? 'bg-slate-900/95 border-slate-700/80 text-white backdrop-blur-md'
              : 'bg-white/95 border-slate-200 text-slate-900 backdrop-blur-md'
          }`}
        >
          <div className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isDark
                      ? 'hover:bg-slate-800 text-slate-200 hover:text-white'
                      : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                    {opt.color && (
                      <span
                        className={`w-3.5 h-3.5 rounded-full shrink-0 border ${
                          isSelected ? 'border-white/50' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: opt.color }}
                      />
                    )}
                    {opt.symbol && (
                      <span
                        className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {opt.symbol}
                      </span>
                    )}
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <div className="min-w-0">
                      <p className="truncate leading-tight">{opt.label}</p>
                      {opt.description && (
                        <p
                          className={`text-[10px] truncate font-normal mt-0.5 ${
                            isSelected ? 'text-emerald-100' : isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          {opt.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0 ml-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
