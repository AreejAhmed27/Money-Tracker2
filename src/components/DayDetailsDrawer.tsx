import React from 'react';
import { X, Plus, Trash2, Edit3 } from 'lucide-react';
import { CATEGORIES } from '../constants/categories';
import { ExpenseItem } from '../types';
import { formatDateDisplay, formatCurrency } from '../utils/formatters';

interface DayDetailsDrawerProps {
  selectedDate: string | null;
  expenses: ExpenseItem[];
  currencyCode?: string;
  isDark?: boolean;
  onClose: () => void;
  onOpenLogExpenseForDate: (dateStr: string) => void;
  onDeleteExpense: (id: string) => void;
  onEditExpense: (item: ExpenseItem) => void;
}

export const DayDetailsDrawer: React.FC<DayDetailsDrawerProps> = ({
  selectedDate,
  expenses,
  currencyCode = 'EGP',
  isDark = false,
  onClose,
  onOpenLogExpenseForDate,
  onDeleteExpense,
  onEditExpense,
}) => {
  const [itemToDelete, setItemToDelete] = React.useState<ExpenseItem | null>(null);

  if (!selectedDate) return null;

  const dayExpenses = expenses.filter((e) => e.entry_date === selectedDate);
  const totalSpent = dayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const modalBg = isDark
    ? 'bg-slate-900 border-slate-800 text-white'
    : 'bg-white border-slate-200/80 text-slate-900';

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity animate-in fade-in">
      <div className={`w-full max-w-lg ${modalBg} rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border max-h-[85vh] flex flex-col`}>
        {/* Header bar */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-800/80' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div>
            <h3 className="text-base font-bold">
              {formatDateDisplay(selectedDate)}
            </h3>
            <p className="text-xs font-medium text-slate-400">
              Total spent:{' '}
              <strong className="text-red-500 font-mono">-{formatCurrency(totalSpent, currencyCode)}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200/70 hover:bg-slate-300 text-slate-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transaction list for day */}
        <div className={`p-4 overflow-y-auto flex-1 divide-y ${
          isDark ? 'divide-slate-800' : 'divide-slate-100'
        }`}>
          {dayExpenses.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No expenses recorded for this date.
            </div>
          ) : (
            dayExpenses.map((item) => {
              const meta = CATEGORIES[item.category];

              return (
                <div
                  key={item.transaction_id}
                  className={`py-3 flex items-center justify-between gap-2 px-2 rounded-xl transition group ${
                    isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: meta.color }}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold truncate max-w-[140px] sm:max-w-xs">
                          {item.notes || item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium truncate">{item.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 text-right">
                    <span className="text-xs sm:text-sm font-bold text-red-500 font-mono whitespace-nowrap">
                      -{formatCurrency(item.amount, currencyCode)}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          onClose();
                          onEditExpense(item);
                        }}
                        className={`p-1.5 rounded-lg transition ${
                          isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setItemToDelete(item)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add Item button at bottom */}
        <div className={`p-4 border-t ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
          <button
            onClick={() => {
              onClose();
              onOpenLogExpenseForDate(selectedDate);
            }}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item for {formatDateDisplay(selectedDate)}</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-sm rounded-2xl border shadow-2xl p-5 space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-700'
              }`}>
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Confirm Expense Deletion
                </h3>
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {itemToDelete.category}
                </p>
              </div>
            </div>

            <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              Are you sure you want to delete this expense entry for <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>{itemToDelete.notes || itemToDelete.category}</strong> (<strong className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>{formatCurrency(itemToDelete.amount, currencyCode)}</strong>)?
            </p>

            <div className={`flex items-center justify-end space-x-2 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl cursor-pointer transition ${
                  isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteExpense(itemToDelete.transaction_id);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

