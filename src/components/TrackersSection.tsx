import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Check,
  Trash2,
  Coins,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Edit2,
  Folder,
} from 'lucide-react';
import { CategoryMeta, ExpenseItem, TrackerProfile } from '../types';
import { SUPPORTED_CURRENCIES, getCurrencySymbol } from '../constants/currencies';
import { SwipeableRow } from './SwipeableRow';
import { CategoryIcon } from './CategoryIcon';
import { PrettySelect } from './PrettySelect';

interface TrackersSectionProps {
  trackers: TrackerProfile[];
  activeTrackerId: string;
  expenses?: ExpenseItem[];
  catList?: string[];
  categoriesMap?: Record<string, CategoryMeta>;
  isDark?: boolean;
  onSelectTracker: (id: string) => void;
  onSaveTracker: (tracker: { id?: string; name: string; currencyCode: string }) => void;
  onDeleteTracker: (id: string) => void;
  onSelectCategoryForLogs?: (categoryName: string) => void;
  onAddCategory?: () => void;
  onEditCategory?: (categoryMeta: CategoryMeta) => void;
  onDeleteCategory?: (categoryName: string) => void;
}

export const TrackersSection: React.FC<TrackersSectionProps> = ({
  trackers,
  activeTrackerId,
  expenses = [],
  catList = [],
  categoriesMap = {},
  isDark = false,
  onSelectTracker,
  onSaveTracker,
  onDeleteTracker,
  onSelectCategoryForLogs,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTracker, setEditingTracker] = useState<TrackerProfile | null>(null);
  const [trackerToDelete, setTrackerToDelete] = useState<TrackerProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Expanded state for each tracker (collapsed by default unless user clicks dropdown)
  const [expandedTrackers, setExpandedTrackers] = useState<Record<string, boolean>>({});

  const isTrackerExpanded = (id: string) => {
    return !!expandedTrackers[id];
  };

  const toggleTrackerExpand = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedTrackers((prev) => ({
      ...prev,
      [id]: !isTrackerExpanded(id),
    }));
  };

  // Form State
  const [name, setName] = useState('');
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [isCustomCurrency, setIsCustomCurrency] = useState(false);
  const [customCurrency, setCustomCurrency] = useState('');

  const handleOpenAdd = () => {
    setEditingTracker(null);
    setName('');
    setCurrencyCode('USD');
    setIsCustomCurrency(false);
    setCustomCurrency('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (t: TrackerProfile) => {
    setEditingTracker(t);
    setName(t.name);
    const isStandard = SUPPORTED_CURRENCIES.some((c) => c.code === t.currencyCode);
    if (isStandard) {
      setCurrencyCode(t.currencyCode);
      setIsCustomCurrency(false);
      setCustomCurrency('');
    } else {
      setIsCustomCurrency(true);
      setCustomCurrency(t.currencyCode);
    }
    setIsFormOpen(true);
  };

  const handleConfirmDeleteTracker = () => {
    if (trackerToDelete) {
      onDeleteTracker(trackerToDelete.id);
      setTrackerToDelete(null);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCurrency = isCustomCurrency
      ? customCurrency.trim().toUpperCase() || 'USD'
      : currencyCode;
    const finalName = name.trim() || `${finalCurrency} Tracker`;

    onSaveTracker({
      id: editingTracker?.id,
      name: finalName,
      currencyCode: finalCurrency,
    });

    setIsFormOpen(false);
    setEditingTracker(null);
  };

  // Filter trackers or sub-categories if searching
  const filteredTrackers = trackers.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.currencyCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = catList.filter((catName) =>
    catName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-3.5 space-y-4 bg-slate-900">
      {/* Search Input Bar (Simplified Design Reference) */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search trackers or categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Section Header: Trackers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Currency Trackers ({filteredTrackers.length})
          </span>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-3 h-3" />
            <span>New Tracker</span>
          </button>
        </div>

        {/* Swipeable hint */}
        <p className="text-[10px] text-slate-400 px-1 font-medium">
          Slide left on any tracker or category to edit or delete
        </p>

        {/* List of Trackers */}
        <div className="space-y-2">
          {filteredTrackers.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No trackers match "{searchQuery}"
            </div>
          ) : (
            filteredTrackers.map((t) => {
              const isActive = t.id === activeTrackerId;
              const symbol = getCurrencySymbol(t.currencyCode);
              const expanded = searchQuery ? true : isTrackerExpanded(t.id);

              return (
                <div key={t.id} className="space-y-1">
                  {/* Tracker Item Row (Swipeable Left for Edit/Delete) */}
                  <SwipeableRow
                    isDark={true}
                    onEdit={() => handleOpenEdit(t)}
                    onDelete={trackers.length > 1 ? () => setTrackerToDelete(t) : undefined}
                  >
                    <div
                      onClick={() => onSelectTracker(t.id)}
                      className={`p-2.5 px-3 rounded-xl flex items-center justify-between gap-2.5 transition cursor-pointer group ${
                        isActive
                          ? 'bg-slate-800/90 text-white border-l-4 border-emerald-500 shadow-xs'
                          : 'bg-slate-950/50 hover:bg-slate-800/50 text-slate-300 border border-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        {/* Tracker Inline Icon (No circular box) */}
                        <Coins
                          className={`w-4 h-4 shrink-0 transition ${
                            isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />

                        {/* Tracker Title */}
                        <div className="min-w-0 flex items-center gap-1.5">
                          <span className="text-xs font-bold truncate text-white">{t.name}</span>
                          {isActive && (
                            <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase tracking-wider">
                              Active
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Currency Badge & Expand Button */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800/80 font-mono text-[10px] font-extrabold text-emerald-400">
                          {symbol} {t.currencyCode}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => toggleTrackerExpand(t.id, e)}
                          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                          title={expanded ? 'Collapse categories' : 'Expand categories'}
                        >
                          {expanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </SwipeableRow>

                  {/* Categories inside this Tracker (Nested Tabs coming out from left) */}
                  {expanded && (
                    <div className="ml-3 pl-3 border-l-2 border-slate-800 my-1.5 space-y-1">
                      <div className="flex items-center justify-between py-1 px-1">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                          Categories
                        </span>
                        {onAddCategory && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isActive) onSelectTracker(t.id);
                              onAddCategory();
                            }}
                            className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>

                      {filteredCategories.length === 0 ? (
                        <div className="text-center py-2 text-[11px] text-slate-400 italic">
                          No categories found.
                        </div>
                      ) : (
                        filteredCategories.map((catName) => {
                          const meta = categoriesMap[catName];
                          const logCount = isActive
                            ? expenses.filter((e) => e.category === catName).length
                            : 0;

                          return (
                            <SwipeableRow
                              key={catName}
                              isDark={true}
                              onEdit={() => meta && onEditCategory?.(meta)}
                              onDelete={() => onDeleteCategory?.(catName)}
                            >
                              <div
                                onClick={() => {
                                  onSelectTracker(t.id);
                                  onSelectCategoryForLogs?.(catName);
                                }}
                                className="p-2.5 px-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-800/80 text-slate-200 flex items-center justify-between transition cursor-pointer group shadow-xs"
                              >
                                <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                                  {/* Plain Category Icon (No box wrapper) */}
                                  <CategoryIcon
                                    iconName={meta?.iconName}
                                    className="w-4 h-4 shrink-0 transition group-hover:scale-110"
                                    style={{ color: meta?.color || '#10B981' }}
                                  />

                                  <span className="text-xs font-bold text-slate-200 truncate group-hover:text-white">
                                    {catName}
                                  </span>
                                </div>

                                <div className="flex items-center space-x-2 shrink-0">
                                  {isActive && (
                                    <span className="px-2 py-0.5 rounded-lg bg-slate-900/90 text-emerald-400 font-mono text-[10px] font-extrabold border border-slate-800/80">
                                      {logCount}
                                    </span>
                                  )}
                                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition group-hover:translate-x-0.5" />
                                </div>
                              </div>
                            </SwipeableRow>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: Create / Edit Tracker */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[130] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  {editingTracker ? 'Edit Currency Tracker' : 'Add New Currency Tracker'}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {editingTracker
                    ? 'Update tracker name or currency code'
                    : 'Create an independent tracking system with its own currency'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Tracker Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. USD Travel Fund, Euros Business"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              {/* Currency Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Select Currency</label>

                {!isCustomCurrency ? (
                  <PrettySelect
                    value={currencyCode}
                    isDark={true}
                    options={[
                      ...SUPPORTED_CURRENCIES.map((c) => ({
                        value: c.code,
                        label: `${c.code} (${c.symbol}) — ${c.name}`,
                        symbol: c.symbol,
                        description: `Official unit (${c.symbol})`,
                      })),
                      {
                        value: 'CUSTOM',
                        label: '+ Other Custom Currency Code...',
                        description: 'Enter custom unit (e.g. BTC, INR)',
                      },
                    ]}
                    onChange={(val) => {
                      if (val === 'CUSTOM') {
                        setIsCustomCurrency(true);
                      } else {
                        setCurrencyCode(val);
                      }
                    }}
                  />
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. BTC, INR, SEK"
                      value={customCurrency}
                      onChange={(e) => setCustomCurrency(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomCurrency(false)}
                      className="text-[11px] text-emerald-400 hover:underline font-semibold cursor-pointer"
                    >
                      ← Back to standard list
                    </button>
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{editingTracker ? 'Save Changes' : 'Create Tracker'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Tracker Confirmation */}
      {trackerToDelete && (
        <div className="fixed inset-0 z-[130] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-2xl p-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Delete Tracker</h3>
                <p className="text-xs text-rose-300 font-semibold">{trackerToDelete.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Are you sure you want to delete the tracker <strong className="text-white font-bold">{trackerToDelete.name}</strong> ({trackerToDelete.currencyCode})? All data stored inside this tracker will be permanently removed.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setTrackerToDelete(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTracker}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Tracker</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

