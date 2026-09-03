import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { getTodayDateString } from '../utils/formatters';
import { PrettyDatePicker } from './PrettyDatePicker';
import { PaymentMethod } from '../types';
import { PaymentMethodSelector } from './PaymentMethodSelector';

interface AddAssetSheetProps {
  isOpen: boolean;
  currencyCode?: string;
  isDark?: boolean;
  paymentMethods?: PaymentMethod[];
  defaultPaymentMethodId?: string;
  onOpenManagePaymentMethods?: () => void;
  onClose: () => void;
  onSaveAsset: (asset: {
    amount: number;
    source_label: string;
    date_added: string;
    paymentMethodId?: string;
    paymentMethodName?: string;
    notes?: string;
  }) => void;
}

export const AddAssetSheet: React.FC<AddAssetSheetProps> = ({
  isOpen,
  currencyCode = 'EGP',
  isDark = false,
  paymentMethods = [],
  defaultPaymentMethodId = 'pm-cash',
  onOpenManagePaymentMethods,
  onClose,
  onSaveAsset,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [sourceLabel, setSourceLabel] = useState<string>('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>(defaultPaymentMethodId);
  const [selectedPaymentMethodName, setSelectedPaymentMethodName] = useState<string>('Cash');
  const [dateAdded, setDateAdded] = useState<string>(getTodayDateString());
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  const quickPicks = ['Starting Cash', 'Salary', 'Bonus', 'Top-up', 'Investment Return'];

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setSourceLabel('');
      const initialMethod = paymentMethods.find((p) => p.id === defaultPaymentMethodId) || paymentMethods[0];
      setSelectedPaymentMethodId(defaultPaymentMethodId || initialMethod?.id || 'pm-cash');
      setSelectedPaymentMethodName(initialMethod?.name || 'Cash');
      setDateAdded(getTodayDateString());
      setNotes('');
      setError('');
    }
  }, [isOpen, defaultPaymentMethodId, paymentMethods]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError(`Please enter a valid amount greater than 0 ${currencyCode}.`);
      return;
    }

    if (!sourceLabel.trim()) {
      setError('Please specify the source description (e.g., Starting Cash, Salary).');
      return;
    }

    onSaveAsset({
      amount: numericAmount,
      source_label: sourceLabel.trim(),
      date_added: dateAdded,
      paymentMethodId: selectedPaymentMethodId,
      paymentMethodName: selectedPaymentMethodName,
      notes: notes.trim(),
    });

    onClose();
  };

  const sheetBg = isDark
    ? 'bg-slate-900 border-slate-800 text-white'
    : 'bg-white border-slate-200/80 text-slate-900';

  const inputBg = isDark
    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400';

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-end justify-center sm:items-center p-0 sm:p-4 transition-opacity animate-in fade-in">
      <div className={`w-full max-w-lg ${sheetBg} rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border max-h-[90vh] flex flex-col`}>
        {/* Drag handle / Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-800/80' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <h3 className="text-base font-bold">Add Funds / Asset</h3>
          </div>

          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200/80 hover:bg-slate-300 text-slate-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 pb-24 sm:pb-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount Field */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Amount ({currencyCode}) *
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400 font-mono font-bold text-sm sm:text-base">
                {currencyCode}
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError('');
                }}
                className={`w-full pl-16 pr-4 py-3 ${inputBg} rounded-xl text-2xl font-extrabold font-mono focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20`}
                autoFocus
              />
            </div>
          </div>

          {/* Source Label */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Source Description *
            </label>
            <input
              type="text"
              placeholder="e.g., Starting Cash, Salary, Bonus"
              value={sourceLabel}
              onChange={(e) => {
                setSourceLabel(e.target.value);
                if (error) setError('');
              }}
              className={`w-full px-4 py-2.5 ${inputBg} rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500`}
            />

            {/* Quick Pick Chips */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {quickPicks.map((pick) => (
                <button
                  key={pick}
                  type="button"
                  onClick={() => {
                    setSourceLabel(pick);
                    if (error) setError('');
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                    sourceLabel === pick
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : isDark
                      ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  + {pick}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selection */}
          {paymentMethods.length > 0 && (
            <PaymentMethodSelector
              methods={paymentMethods}
              selectedId={selectedPaymentMethodId}
              onChange={(id, name) => {
                setSelectedPaymentMethodId(id);
                setSelectedPaymentMethodName(name);
              }}
              onOpenManageMethods={onOpenManagePaymentMethods}
              isDark={isDark}
              label="Received Via Payment Method"
            />
          )}

          {/* Date Added */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Date Added *
            </label>
            <PrettyDatePicker
              value={dateAdded}
              onChange={(val) => setDateAdded(val)}
              isDark={isDark}
            />
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Notes (optional)
            </label>
            <input
              type="text"
              maxLength={250}
              placeholder="e.g., Monthly stipend, Project bonus, Bank transfer reference"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full px-4 py-2.5 ${inputBg} rounded-xl text-xs focus:outline-none focus:border-emerald-500`}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold tracking-wide shadow-lg shadow-emerald-600/20 transition active:scale-[0.99]"
            >
              ADD FUNDS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

