import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Tag,
  ChevronLeft,
  Receipt,
  Calendar,
  Search,
  Trash2,
  Check,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import {
  getAllCategoriesMap,
  deleteCategory,
} from '../constants/categories';
import { AddCategoryModal } from './AddCategoryModal';
import { CategoryMeta, ExpenseItem, TrackerProfile } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { SwipeableRow } from './SwipeableRow';
import { PrettySelect, PrettySelectOption } from './PrettySelect';
import { TrackersSection } from './TrackersSection';
import { PrettyDatePicker } from './PrettyDatePicker';

interface CategoriesSidebarProps {
  isOpen: boolean;
  isDark?: boolean;
  expenses?: ExpenseItem[];
  currencyCode?: string;
  trackers?: TrackerProfile[];
  activeTrackerId?: string;
  onSelectTracker?: (id: string) => void;
  onSaveTracker?: (tracker: { id?: string; name: string; currencyCode: string }) => void;
  onDeleteTracker?: (id: string) => void;
  onClose: () => void;
  onCategoriesUpdated?: () => void;
  onDeleteExpense?: (id: string) => void;
}

export const CategoriesSidebar: React.FC<CategoriesSidebarProps> = ({
  isOpen,
  isDark = false,
  expenses = [],
  currencyCode = 'EGP',
  trackers = [],
  activeTrackerId = 'default',
  onSelectTracker,
  onSaveTracker,
  onDeleteTracker,
  onClose,
  onCategoriesUpdated,
  onDeleteExpense,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryMeta | null>(null);
  const [categoriesMap, setCategoriesMap] = useState(getAllCategoriesMap());
  const [selectedCategoryForLogs, setSelectedCategoryForLogs] = useState<string | null>(null);

  // Search Mode state in sidebar
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');

  // Multi-select state for deleting logs
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Swipe gesture refs to close sidebar
  const swipeStartX = useRef<number | null>(null);
  const swipeStartY = useRef<number | null>(null);

  const handleDrawerTouchStart = (e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX;
    swipeStartY.current = e.touches[0].clientY;
  };

  const handleDrawerTouchEnd = (e: React.TouchEvent) => {
    if (swipeStartX.current === null || swipeStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - swipeStartX.current;
    const deltaY = e.changedTouches[0].clientY - swipeStartY.current;

    swipeStartX.current = null;
    swipeStartY.current = null;

    if (Math.abs(deltaY) < 80 && deltaX < -50) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCategoriesMap(getAllCategoriesMap());
      setSelectedCategoryForLogs(null);
      setIsSearchActive(false);
      setSearchKeyword('');
      setFilterCategory('all');
      setFilterDate('');
      setSelectedLogIds([]);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedLogIds([]);
  }, [selectedCategoryForLogs, isSearchActive]);

  if (!isOpen) return null;

  const handleHoldStart = (id: string) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      setSelectedLogIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }, 450);
  };

  const handleHoldEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleToggleSelectLog = (id: string) => {
    setSelectedLogIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSelectedLogs = () => {
    if (onDeleteExpense && selectedLogIds.length > 0) {
      selectedLogIds.forEach((id) => onDeleteExpense(id));
      setSelectedLogIds([]);
    }
  };

  const handleRefresh = () => {
    setCategoriesMap(getAllCategoriesMap());
    if (onCategoriesUpdated) {
      onCategoriesUpdated();
    }
  };

  const handleConfirmDelete = (catName: string) => {
    deleteCategory(catName);
    setCategoryToDelete(null);
    handleRefresh();
  };

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEditCategory = (meta: CategoryMeta) => {
    setEditingCategory(meta);
    setIsModalOpen(true);
  };

  const catList = Object.keys(categoriesMap);

  // Filter logs for selected category view
  const categoryLogs = selectedCategoryForLogs
    ? expenses.filter((e) => e.category === selectedCategoryForLogs)
    : [];
  const categoryTotalSpent = categoryLogs.reduce((sum, e) => sum + e.amount, 0);
  const selectedMeta = selectedCategoryForLogs ? categoriesMap[selectedCategoryForLogs] : null;

  // Filter logs for Search mode
  const searchFilteredLogs = expenses.filter((e) => {
    const matchesKeyword =
      !searchKeyword ||
      e.notes?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      e.category.toLowerCase().includes(searchKeyword.toLowerCase());

    const matchesCategory =
      filterCategory === 'all' || e.category === filterCategory;

    const matchesDate = !filterDate || e.entry_date === filterDate;

    return matchesKeyword && matchesCategory && matchesDate;
  });

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[90] bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
      />

      {/* Drawer Panel on Left */}
      <div
        onTouchStart={handleDrawerTouchStart}
        onTouchEnd={handleDrawerTouchEnd}
        className="fixed top-0 bottom-0 left-0 z-[100] w-full sm:w-96 max-w-[90vw] bg-slate-900 border-r border-slate-800 text-white shadow-2xl flex flex-col transition-transform animate-in slide-in-from-left duration-250 pb-20 sm:pb-4"
      >
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 min-w-0">
            {selectedCategoryForLogs ? (
              <button
                type="button"
                onClick={() => setSelectedCategoryForLogs(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Back to categories"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : isSearchActive ? (
              <button
                type="button"
                onClick={() => setIsSearchActive(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Back to categories"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <Wallet className="w-5 h-5 text-emerald-400 shrink-0 mr-1" />
            )}

            <div className="min-w-0">
              <h2 className="text-sm font-extrabold text-white truncate leading-tight">
                {selectedCategoryForLogs
                  ? selectedCategoryForLogs
                  : isSearchActive
                  ? 'Search & Filter Logs'
                  : 'Trackers'}
              </h2>
              <p className="text-[11px] text-slate-400 truncate font-medium">
                {selectedCategoryForLogs
                  ? `${categoryLogs.length} Transactions`
                  : isSearchActive
                  ? 'Filter by category or date'
                  : 'Manage currency trackers & categories'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            {/* Search Toggle Icon */}
            {!selectedCategoryForLogs && (
              <button
                type="button"
                onClick={() => setIsSearchActive(!isSearchActive)}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  isSearchActive
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Search logs by keyword, category, or date"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Multi-Select Delete Action Header (Shown when 1+ logs selected) */}
        {selectedLogIds.length > 0 && (
          <div className="p-3 bg-rose-950/90 border-b border-rose-800/80 flex items-center justify-between shrink-0 animate-in fade-in">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-extrabold flex items-center justify-center shrink-0">
                {selectedLogIds.length}
              </div>
              <span className="text-xs font-bold text-rose-200">
                {selectedLogIds.length === 1 ? '1 log selected' : `${selectedLogIds.length} logs selected`}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSelectedLogIds([])}
                className="px-2.5 py-1 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSelectedLogs}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md transition cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        {selectedCategoryForLogs ? (
          /* View 1: Transaction Logs for Selected Category */
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget && selectedLogIds.length > 0) {
                setSelectedLogIds([]);
              }
            }}
            className="flex-1 flex flex-col min-h-0 bg-slate-900"
          >
            {/* Category Stats Bar */}
            <div className="p-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-slate-400">Total Spent</span>
              <span className="text-sm font-black font-mono text-emerald-400">
                {formatCurrency(categoryTotalSpent, currencyCode)}
              </span>
            </div>

            {/* List of Category Logs */}
            <div
              onClick={(e) => {
                if (e.target === e.currentTarget && selectedLogIds.length > 0) {
                  setSelectedLogIds([]);
                }
              }}
              className="flex-1 overflow-y-auto p-3 space-y-1"
            >
              {categoryLogs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 space-y-2">
                  <Receipt className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                  <p className="text-xs font-bold text-slate-300">No logs for "{selectedCategoryForLogs}"</p>
                </div>
              ) : (
                categoryLogs.map((log) => {
                  const isSelected = selectedLogIds.includes(log.transaction_id);
                  const isMultiSelectMode = selectedLogIds.length > 0;

                  return (
                    <SwipeableRow
                      key={log.transaction_id}
                      isDark={true}
                      onDelete={
                        onDeleteExpense
                          ? () => onDeleteExpense(log.transaction_id)
                          : undefined
                      }
                    >
                      <div
                        onClick={() => {
                          if (isMultiSelectMode) {
                            handleToggleSelectLog(log.transaction_id);
                          }
                        }}
                        onTouchStart={() => handleHoldStart(log.transaction_id)}
                        onTouchEnd={handleHoldEnd}
                        onTouchMove={handleHoldEnd}
                        onMouseDown={() => handleHoldStart(log.transaction_id)}
                        onMouseUp={handleHoldEnd}
                        onMouseLeave={handleHoldEnd}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 transition cursor-pointer select-none ${
                          isSelected
                            ? 'bg-rose-950/40 border-rose-500/80 text-white'
                            : 'bg-slate-800 border-slate-700 text-white'
                        }`}
                      >
                        {isMultiSelectMode && (
                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition ${
                              isSelected
                                ? 'bg-rose-600 border-rose-500 text-white'
                                : 'border-slate-600 bg-slate-800/80 text-transparent'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                            <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{log.entry_date}</span>
                          </div>
                          <p className="text-xs font-bold text-white truncate mt-0.5">
                            {log.notes || `${log.category} Expense`}
                          </p>
                        </div>
                        <span className="text-xs font-black font-mono text-red-400 shrink-0">
                          -{formatCurrency(log.amount, currencyCode)}
                        </span>
                      </div>
                    </SwipeableRow>
                  );
                })
              )}
            </div>
          </div>
        ) : isSearchActive ? (
          /* View 2: Search & Filter Logs Mode (Request 9) */
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget && selectedLogIds.length > 0) {
                setSelectedLogIds([]);
              }
            }}
            className="flex-1 flex flex-col min-h-0 bg-slate-900 p-3 space-y-3"
          >
            {/* Search Input Controls */}
            <div className="space-y-2 shrink-0 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              {/* Keyword Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search keyword or note..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

            {/* Filters row: Category & Date */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Category
                </label>
                <PrettySelect
                  value={filterCategory}
                  onChange={(val) => setFilterCategory(val as string)}
                  isDark={true}
                  size="sm"
                  options={[
                    { value: 'all', label: 'All Categories' },
                    ...catList.map((c) => ({
                      value: c,
                      label: c,
                      color: categoriesMap[c]?.color || '#10B981',
                    })),
                  ]}
                />
              </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Date Filter
                  </label>
                  <PrettyDatePicker
                    value={filterDate}
                    onChange={(val) => setFilterDate(val)}
                    isDark={true}
                    size="sm"
                  />
                </div>
              </div>

              {(searchKeyword || filterCategory !== 'all' || filterDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchKeyword('');
                    setFilterCategory('all');
                    setFilterDate('');
                  }}
                  className="text-[10px] text-emerald-400 hover:underline font-bold block"
                >
                  Reset search filters
                </button>
              )}
            </div>

            {/* Filtered Search Results */}
            <div
              onClick={(e) => {
                if (e.target === e.currentTarget && selectedLogIds.length > 0) {
                  setSelectedLogIds([]);
                }
              }}
              className="flex-1 overflow-y-auto space-y-1"
            >
              <p className="text-[11px] font-black uppercase text-slate-400 px-1 mb-1">
                Results ({searchFilteredLogs.length})
              </p>

              {searchFilteredLogs.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No transaction logs match your filter criteria.
                </div>
              ) : (
                searchFilteredLogs.map((log) => {
                  const isSelected = selectedLogIds.includes(log.transaction_id);
                  const isMultiSelectMode = selectedLogIds.length > 0;

                  return (
                    <SwipeableRow
                      key={log.transaction_id}
                      isDark={true}
                      onDelete={
                        onDeleteExpense
                          ? () => onDeleteExpense(log.transaction_id)
                          : undefined
                      }
                    >
                      <div
                        onClick={() => {
                          if (isMultiSelectMode) {
                            handleToggleSelectLog(log.transaction_id);
                          }
                        }}
                        onTouchStart={() => handleHoldStart(log.transaction_id)}
                        onTouchEnd={handleHoldEnd}
                        onTouchMove={handleHoldEnd}
                        onMouseDown={() => handleHoldStart(log.transaction_id)}
                        onMouseUp={handleHoldEnd}
                        onMouseLeave={handleHoldEnd}
                        className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 transition cursor-pointer select-none ${
                          isSelected
                            ? 'bg-rose-950/40 border-rose-500/80 text-white'
                            : 'bg-slate-800 border-slate-700 text-white'
                        }`}
                      >
                        {isMultiSelectMode && (
                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition ${
                              isSelected
                                ? 'bg-rose-600 border-rose-500 text-white'
                                : 'border-slate-600 bg-slate-800/80 text-transparent'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                            <span className="font-bold text-emerald-400">{log.category}</span>
                            <span>•</span>
                            <span>{log.entry_date}</span>
                          </div>
                          <p className="text-xs font-bold text-white truncate mt-0.5">
                            {log.notes || log.category}
                          </p>
                        </div>
                        <span className="text-xs font-black font-mono text-red-400 shrink-0">
                          -{formatCurrency(log.amount, currencyCode)}
                        </span>
                      </div>
                    </SwipeableRow>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* View 3: Trackers List View with Sub-Categories */
          <div className="flex-1 overflow-y-auto bg-slate-900">
            {onSelectTracker && onSaveTracker && onDeleteTracker && (
              <TrackersSection
                trackers={trackers}
                activeTrackerId={activeTrackerId}
                expenses={expenses}
                catList={catList}
                categoriesMap={categoriesMap}
                isDark={isDark}
                onSelectTracker={(id) => {
                  onSelectTracker(id);
                  onClose();
                }}
                onSaveTracker={onSaveTracker}
                onDeleteTracker={onDeleteTracker}
                onSelectCategoryForLogs={(catName) => setSelectedCategoryForLogs(catName)}
                onAddCategory={handleOpenAddCategory}
                onEditCategory={(meta) => handleOpenEditCategory(meta)}
                onDeleteCategory={(catName) => setCategoryToDelete(catName)}
              />
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      <AddCategoryModal
        isOpen={isModalOpen}
        isDark={isDark}
        editingCategory={editingCategory}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onCategorySaved={handleRefresh}
      />

      {/* Delete Category Confirmation Modal */}
      {categoryToDelete && (
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
                  Confirm Category Deletion
                </h3>
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {categoryToDelete}
                </p>
              </div>
            </div>

            <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              Are you sure you want to delete the category <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>{categoryToDelete}</strong>?
            </p>

            <div className={`flex items-center justify-end space-x-2 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
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
                onClick={() => handleConfirmDelete(categoryToDelete)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
