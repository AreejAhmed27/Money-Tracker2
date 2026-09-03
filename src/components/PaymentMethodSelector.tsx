import React, { useState, useRef, useEffect } from 'react';
import { PaymentMethod } from '../types';
import { PaymentMethodIcon } from './PaymentMethodIcon';
import { Plus, Check, ChevronDown, Settings } from 'lucide-react';

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selectedId?: string;
  onChange: (methodId: string, methodName: string) => void;
  onOpenManageMethods?: () => void;
  isDark?: boolean;
  label?: string;
  required?: boolean;
  variant?: 'dropdown' | 'grid';
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  methods = [],
  selectedId,
  onChange,
  onOpenManageMethods,
  isDark = false,
  label = 'Payment Method',
  required = false,
  variant = 'dropdown',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedMethod = methods.find((m) => m.id === selectedId) || methods[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'grid') {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            {label} {required && '*'}
          </label>
          {onOpenManageMethods && (
            <button
              type="button"
              onClick={onOpenManageMethods}
              className="text-[11px] font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Manage Methods</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {methods.map((method) => {
            const isSelected = selectedId === method.id;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => onChange(method.id, method.name)}
                className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20 text-white'
                      : 'border-slate-900 ring-2 ring-slate-900/20 bg-emerald-50/50 text-slate-900 shadow-xs'
                    : isDark
                    ? 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-300'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${method.color || '#10B981'}15`,
                      borderColor: `${method.color || '#10B981'}35`,
                      color: method.color || '#10B981',
                    }}
                  >
                    <PaymentMethodIcon
                      type={method.type}
                      iconName={method.iconName}
                      className="w-3.5 h-3.5"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold truncate block">
                      {method.name}
                    </span>
                    {method.isDefault && (
                      <span className="text-[9px] text-emerald-500 font-semibold block leading-none">
                        Default
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Dropdown Menu Variant (Default)
  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          {label} {required && '*'}
        </label>
        {onOpenManageMethods && (
          <button
            type="button"
            onClick={onOpenManageMethods}
            className="text-[11px] font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Manage Methods</span>
          </button>
        )}
      </div>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 rounded-xl border font-bold cursor-pointer transition select-none ${
          isDark
            ? 'bg-slate-800/90 border-slate-700/90 text-white hover:bg-slate-800 hover:border-emerald-500/50'
            : 'bg-slate-50 border-slate-300 text-slate-900 hover:bg-slate-100 hover:border-slate-400'
        }`}
      >
        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
          {selectedMethod && (
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: `${selectedMethod.color || '#10B981'}15`,
                borderColor: `${selectedMethod.color || '#10B981'}35`,
                color: selectedMethod.color || '#10B981',
              }}
            >
              <PaymentMethodIcon
                type={selectedMethod.type}
                iconName={selectedMethod.iconName}
                className="w-4 h-4"
              />
            </div>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-extrabold truncate">
              {selectedMethod?.name || 'Select Payment Method'}
            </span>
            {selectedMethod?.isDefault && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Default
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-emerald-500 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 scale-110' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border shadow-2xl p-1.5 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? 'bg-slate-900/95 border-slate-700/80 text-white backdrop-blur-md'
              : 'bg-white/95 border-slate-200 text-slate-900 backdrop-blur-md'
          }`}
        >
          <div className="space-y-1">
            {methods.map((method) => {
              const isSelected = method.id === selectedMethod?.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    onChange(method.id, method.name);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isDark
                      ? 'hover:bg-slate-800 text-slate-200 hover:text-white'
                      : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: isSelected
                          ? 'rgba(255, 255, 255, 0.2)'
                          : `${method.color || '#10B981'}15`,
                        borderColor: isSelected
                          ? 'rgba(255, 255, 255, 0.3)'
                          : `${method.color || '#10B981'}35`,
                        color: isSelected ? '#ffffff' : (method.color || '#10B981'),
                      }}
                    >
                      <PaymentMethodIcon
                        type={method.type}
                        iconName={method.iconName}
                        className="w-4 h-4"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold truncate block">
                          {method.name}
                        </span>
                        {method.isDefault && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            Default
                          </span>
                        )}
                      </div>
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

          {onOpenManageMethods && (
            <div className="mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenManageMethods();
                }}
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center gap-2 transition cursor-pointer text-emerald-500 hover:bg-emerald-500/10`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manage Payment Methods...</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

