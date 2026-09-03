import React, { useState } from 'react';
import { Search, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';
import { CATEGORIES } from '../constants/categories';
import { AssetItem, CategoryType, ExpenseItem } from '../types';
import { formatDateDisplay, formatCurrency } from '../utils/formatters';
import { SwipeableRow } from './SwipeableRow';

interface RecentTransactionsListProps {
  expenses: ExpenseItem[];
  assets: AssetItem[];
  activeMonth: string;
  activeYear: number;
  currencyCode?: string;
  selectedCategory: CategoryType | null;
  onDeleteExpense: (id: string) => void;
  onDeleteAsset: (id: string) => void;
  onEditExpense: (item: ExpenseItem) => void;
  onOpenAddFunds?: () => void;
  onOpenLogExpense?: () => void;
  isDark?: boolean;
}

export const RecentTransactionsList: React.FC<RecentTransactionsListProps> = ({
  expenses,
  assets,
  activeMonth,
  activeYear,
  currencyCode = 'EGP',
  selectedCategory,
  onDeleteExpense,
  onDeleteAsset,
  onEditExpense,
  isDark = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'asset'>('all');
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseItem | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<AssetItem | null>(null);

  // Filter expenses and assets for selected month and active year
  const monthExpenses = expenses.filter(
    (e) =>
      e.month_name.toLowerCase() === activeMonth.toLowerCase() &&
      e.year === activeYear &&
      (!selectedCategory || e.category === selectedCategory) &&
      (searchTerm === '' ||
        e.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const monthAssets = assets.filter(
    (a) =>
      a.month_name.toLowerCase() === activeMonth.toLowerCase() &&
      a.year === activeYear &&
      !selectedCategory &&
      (searchTerm === '' ||
        a.source_label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.notes?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  type CombinedItem =
    | ({ type: 'expense' } & ExpenseItem)
    | ({ type: 'asset' } & AssetItem);

  const combined: CombinedItem[] = [];

  if (filterType === 'all' || filterType === 'expense') {
    monthExpenses.forEach((e) => combined.push({ type: 'expense', ...e }));
  }

  if (filterType === 'all' || filterType === 'asset') {
    monthAssets.forEach((a) => combined.push({ type: 'asset', ...a }));
  }

  combined.sort((a, b) => {
    const dateA = a.type === 'expense' ? a.entry_date : a.date_added;
    const dateB = b.type === 'expense' ? b.entry_date : b.date_added;
    return dateB.localeCompare(dateA);
  });

  const cardBg = isDark
    ? 'bg-slate-900 border-slate-800 text-white'
    : 'bg-white border-slate-200/80 text-slate-900';

  return (
    <div className={`${cardBg} rounded-2xl p-5 border shadow-sm`}>
      {/* List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold">Ledger & Activity Log</h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {activeMonth} {activeYear} {selectedCategory ? `• Category: ${selectedCategory}` : ''}
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center space-x-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Type Segment Filter */}
          <div className={`flex p-0.5 rounded-xl border text-xs font-semibold shrink-0 ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterType === 'all'
                  ? isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterType === 'expense'
                  ? isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setFilterType('asset')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterType === 'asset'
                  ? isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Funds
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Rows */}
      {combined.length === 0 ? (
        <div className={`py-12 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          No transactions match your search/filter in {activeMonth} {activeYear}.
        </div>
      ) : (
        <div className="space-y-1">
          {combined.map((item) => {
            if (item.type === 'expense') {
              const meta = CATEGORIES[item.category];

              return (
                <SwipeableRow
                  key={item.transaction_id}
                  isDark={isDark}
                  onEdit={() => onEditExpense(item)}
                  onDelete={() => setExpenseToDelete(item)}
                >
                  <div
                    className={`p-3 flex items-center justify-between gap-2 rounded-2xl border transition ${
                      isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${meta.color}15`,
                          borderColor: `${meta.color}30`,
                          color: meta.color,
                        }}
                      >
                        <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold truncate max-w-[140px] sm:max-w-xs">
                            {item.notes || item.category}
                          </span>
                          <span
                            className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold text-white shrink-0"
                            style={{ backgroundColor: meta.color }}
                          >
                            {item.category}
                          </span>
                        </div>
                        <p className={`text-[10px] sm:text-[11px] font-medium truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {formatDateDisplay(item.entry_date)}
                          {item.paymentMethodName ? ` • via ${item.paymentMethodName}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 text-right">
                      <span className="text-xs sm:text-sm font-bold text-red-500 font-mono whitespace-nowrap">
                        -{formatCurrency(item.amount, currencyCode)}
                      </span>
                    </div>
                  </div>
                </SwipeableRow>
              );
            } else {
              // Asset row
              return (
                <SwipeableRow
                  key={item.asset_id}
                  isDark={isDark}
                  onDelete={() => setAssetToDelete(item)}
                >
                  <div
                    className={`p-3 flex items-center justify-between gap-2 rounded-2xl border transition ${
                      isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold truncate max-w-[140px] sm:max-w-xs">
                            {item.source_label}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                            Funds Added
                          </span>
                        </div>
                        <p className={`text-[10px] sm:text-[11px] font-medium truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {formatDateDisplay(item.date_added)}
                          {item.paymentMethodName ? ` • via ${item.paymentMethodName}` : ''}
                          {item.notes ? ` • ${item.notes}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 text-right">
                      <span className="text-xs sm:text-sm font-bold text-emerald-500 font-mono whitespace-nowrap">
                        +{formatCurrency(item.amount, currencyCode)}
                      </span>
                    </div>
                  </div>
                </SwipeableRow>
              );
            }
          })}
        </div>
      )}

      {/* Delete Confirmation Modal for Expense */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
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
                  {expenseToDelete.category}
                </p>
              </div>
            </div>

            <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              Are you sure you want to delete this expense entry for <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>{expenseToDelete.notes || expenseToDelete.category}</strong> (<strong className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>{formatCurrency(expenseToDelete.amount, currencyCode)}</strong>)?
            </p>

            <div className={`flex items-center justify-end space-x-2 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                type="button"
                onClick={() => setExpenseToDelete(null)}
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
                  onDeleteExpense(expenseToDelete.transaction_id);
                  setExpenseToDelete(null);
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

      {/* Delete Confirmation Modal for Asset / Funds */}
      {assetToDelete && (
        <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
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
                  Confirm Funds Deletion
                </h3>
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {assetToDelete.source_label}
                </p>
              </div>
            </div>

            <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              Are you sure you want to delete this funds entry for <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>{assetToDelete.source_label}</strong> (<strong className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>{formatCurrency(assetToDelete.amount, currencyCode)}</strong>)?
            </p>

            <div className={`flex items-center justify-end space-x-2 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                type="button"
                onClick={() => setAssetToDelete(null)}
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
                  onDeleteAsset(assetToDelete.asset_id);
                  setAssetToDelete(null);
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

