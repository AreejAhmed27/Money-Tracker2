import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Plus, Target } from 'lucide-react';
import {
  CATEGORIES,
  getAllCategoryList,
} from '../constants/categories';
import { CategoryType, ExpenseItem, GoalItem, PaymentMethod } from '../types';
import { getTodayDateString } from '../utils/formatters';
import { AddCategoryModal } from './AddCategoryModal';
import { PrettySelect } from './PrettySelect';
import { PrettyDatePicker } from './PrettyDatePicker';
import { PaymentMethodSelector } from './PaymentMethodSelector';

interface LogExpenseSheetProps {
  isOpen: boolean;
  currencyCode?: string;
  isDark?: boolean;
  goals?: GoalItem[];
  debts?: any[];
  helds?: any[];
  paymentMethods?: PaymentMethod[];
  defaultPaymentMethodId?: string;
  onOpenManagePaymentMethods?: () => void;
  onClose: () => void;
  onSaveExpense: (expense: {
    transaction_id?: string;
    amount: number;
    category: CategoryType;
    entry_date: string;
    notes?: string;
    paymentMethodId?: string;
    paymentMethodName?: string;
    goalId?: string;
  }) => void;
  prefilledDate?: string | null;
  editingItem?: ExpenseItem | null;
}

export const LogExpenseSheet: React.FC<LogExpenseSheetProps> = ({
  isOpen,
  currencyCode = 'EGP',
  isDark = false,
  goals = [],
  paymentMethods = [],
  defaultPaymentMethodId = 'pm-cash',
  onOpenManagePaymentMethods,
  onClose,
  onSaveExpense,
  prefilledDate,
  editingItem,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<CategoryType | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>(defaultPaymentMethodId);
  const [selectedPaymentMethodName, setSelectedPaymentMethodName] = useState<string>('Cash');
  const [entryDate, setEntryDate] = useState<string>(getTodayDateString());
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Custom Category creation modal state
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categoriesList, setCategoriesList] = useState<string[]>(
    getAllCategoryList().filter((c) => c !== 'Money Held' && c !== 'Debts & Installments')
  );

  useEffect(() => {
    setCategoriesList(
      getAllCategoryList().filter((c) => c !== 'Money Held' && c !== 'Debts & Installments')
    );
    const initialMethod = paymentMethods.find((p) => p.id === (editingItem?.paymentMethodId || defaultPaymentMethodId)) || paymentMethods[0];

    if (editingItem) {
      setAmount(editingItem.amount.toString());
      setCategory(editingItem.category);
      setSelectedGoalId(editingItem.goalId || '');
      setSelectedPaymentMethodId(editingItem.paymentMethodId || initialMethod?.id || 'pm-cash');
      setSelectedPaymentMethodName(editingItem.paymentMethodName || initialMethod?.name || 'Cash');
      setEntryDate(editingItem.entry_date);
      setNotes(editingItem.notes || '');
      setError('');
    } else if (prefilledDate) {
      setEntryDate(prefilledDate);
      setAmount('');
      setCategory(null);
      setSelectedGoalId('');
      setSelectedPaymentMethodId(defaultPaymentMethodId || initialMethod?.id || 'pm-cash');
      setSelectedPaymentMethodName(initialMethod?.name || 'Cash');
      setNotes('');
      setError('');
    } else {
      setEntryDate(getTodayDateString());
      setAmount('');
      setCategory(null);
      setSelectedGoalId('');
      setSelectedPaymentMethodId(defaultPaymentMethodId || initialMethod?.id || 'pm-cash');
      setSelectedPaymentMethodName(initialMethod?.name || 'Cash');
      setNotes('');
      setError('');
    }
    setShowAddCategory(false);
  }, [isOpen, prefilledDate, editingItem, defaultPaymentMethodId, paymentMethods]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError(`Please enter a valid expense amount greater than 0 ${currencyCode}.`);
      return;
    }

    if (!category) {
      setError('Please select one of the categories.');
      return;
    }

    onSaveExpense({
      transaction_id: editingItem?.transaction_id,
      amount: numericAmount,
      category,
      entry_date: entryDate,
      notes: notes.trim(),
      paymentMethodId: selectedPaymentMethodId,
      paymentMethodName: selectedPaymentMethodName,
      goalId: category === 'Savings' && selectedGoalId ? selectedGoalId : undefined,
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
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <h3 className="text-base font-bold">
              {editingItem ? 'Edit Expense' : 'Log Expense'}
            </h3>
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
                className={`w-full pl-16 pr-4 py-3 ${inputBg} rounded-xl text-2xl font-extrabold font-mono focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20`}
                autoFocus
              />
            </div>
          </div>

          {/* Category Chips Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Category *
              </label>
              <button
                type="button"
                onClick={() => setShowAddCategory(true)}
                className="text-xs font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Custom Category</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categoriesList.map((catName) => {
                const meta = CATEGORIES[catName];
                const isSelected = category === catName;

                return (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => {
                      setCategory(catName);
                      if (error) setError('');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? isDark ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20' : 'border-slate-900 ring-2 ring-slate-900/20 shadow-xs'
                        : isDark ? 'border-slate-800 bg-slate-800/40 hover:bg-slate-800' : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: meta.color }}
                      />
                      <span className="text-xs font-semibold truncate">
                        {catName}
                      </span>
                    </div>

                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Goal Selector when Savings category is selected */}
          {category === 'Savings' && (
            <div className={`p-3.5 rounded-xl border animate-in fade-in duration-200 ${
              isDark ? 'bg-amber-950/30 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <label className="text-xs font-extrabold uppercase tracking-wider text-amber-400 block mb-1.5 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-400" />
                <span>Link to Specific Savings Goal</span>
              </label>
              <PrettySelect
                value={selectedGoalId}
                onChange={(val) => setSelectedGoalId(val as string)}
                isDark={isDark}
                options={[
                  { value: '', label: 'General Savings (No specific goal)' },
                  ...goals.map((g) => ({
                    value: g.id,
                    label: `Goal: ${g.name}`,
                    description: `Saved: ${g.savedAmount} / ${g.targetAmount} ${currencyCode}`,
                  })),
                ]}
              />
              <p className="text-[11px] text-amber-400/80 mt-1.5 font-medium">
                {selectedGoalId
                  ? '✓ This expense will automatically accumulate into your selected goal!'
                  : 'Logged as general unallocated savings expense.'}
              </p>
            </div>
          )}

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
              label="Paid Via Payment Method"
              variant="dropdown"
            />
          )}

          {/* Date Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Date *
            </label>
            <PrettyDatePicker
              value={entryDate}
              onChange={(val) => setEntryDate(val)}
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
              placeholder="e.g., Grocery store receipt, Taxi fare"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full px-4 py-2.5 ${inputBg} rounded-xl text-xs focus:outline-none focus:border-slate-500`}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold tracking-wide shadow-lg shadow-red-600/20 transition active:scale-[0.99]"
            >
              {editingItem ? 'UPDATE EXPENSE' : 'SAVE EXPENSE'}
            </button>
          </div>
        </form>
      </div>

      {/* Add Custom Category Mini Tab Modal */}
      <AddCategoryModal
        isOpen={showAddCategory}
        isDark={isDark}
        onClose={() => setShowAddCategory(false)}
        onCategorySaved={(newCategory) => {
          setCategoriesList(getAllCategoryList());
          setCategory(newCategory as CategoryType);
          setShowAddCategory(false);
        }}
        onCategoryAdded={(newCategory) => {
          setCategoriesList(getAllCategoryList());
          setCategory(newCategory as CategoryType);
          setShowAddCategory(false);
        }}
      />
    </div>
  );
};

