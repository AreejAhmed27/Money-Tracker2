import React, { useState } from 'react';
import {
  HandCoins,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  X,
  HelpCircle,
  Clock,
  RotateCcw,
  Check,
  ArrowDownLeft,
  Wallet,
} from 'lucide-react';
import { HeldItem, HeldSourceType } from '../types';
import { formatCurrency, getTodayDateString } from '../utils/formatters';
import { SwipeableRow } from './SwipeableRow';
import { PrettyDatePicker } from './PrettyDatePicker';

interface MoneyHeldViewProps {
  heldItems: HeldItem[];
  currencyCode?: string;
  isDark?: boolean;
  ownedBalance?: number;
  onSaveHeldItem: (
    item: Omit<HeldItem, 'id' | 'createdAt'> & { id?: string; sourceType?: HeldSourceType },
    addedAmount?: number,
    addedSourceType?: HeldSourceType
  ) => void;
  onToggleReturned: (id: string) => void;
  onDeleteHeldItem: (id: string) => void;
}

export const MoneyHeldView: React.FC<MoneyHeldViewProps> = ({
  heldItems,
  currencyCode = 'EGP',
  isDark = false,
  ownedBalance = 0,
  onSaveHeldItem,
  onToggleReturned,
  onDeleteHeldItem,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'returned'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HeldItem | null>(null);
  const [itemToConfirmReturned, setItemToConfirmReturned] = useState<HeldItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<HeldItem | null>(null);

  // Form State
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [notes, setNotes] = useState('');
  const [sourceType, setSourceType] = useState<HeldSourceType>('received');
  const [formError, setFormError] = useState<string | null>(null);

  // Return specific amount state
  const [itemToReturnAmount, setItemToReturnAmount] = useState<HeldItem | null>(null);
  const [returnAmountInput, setReturnAmountInput] = useState('');
  const [returnAmountError, setReturnAmountError] = useState<string | null>(null);

  // Add more money state
  const [itemToAddMore, setItemToAddMore] = useState<HeldItem | null>(null);
  const [addAmountInput, setAddAmountInput] = useState('');
  const [addDateInput, setAddDateInput] = useState(getTodayDateString());
  const [addNotesInput, setAddNotesInput] = useState('');
  const [addSourceType, setAddSourceType] = useState<HeldSourceType>('received');
  const [addAmountError, setAddAmountError] = useState<string | null>(null);

  // Calculations
  const activeHeldItems = heldItems.filter((item) => !item.isReturned);
  const returnedHeldItems = heldItems.filter((item) => item.isReturned);

  const totalActiveHeldAmount = activeHeldItems.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  const filteredItems = heldItems.filter((item) => {
    if (activeFilter === 'active') return !item.isReturned;
    if (activeFilter === 'returned') return item.isReturned;
    return true;
  });

  const openAddModal = () => {
    setEditingItem(null);
    setPersonName('');
    setAmount('');
    setDate(getTodayDateString());
    setNotes('');
    setSourceType('received');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: HeldItem) => {
    if (item.isReturned) return;
    setEditingItem(item);
    setPersonName(item.personName);
    setAmount(String(item.amount));
    setDate(item.date || getTodayDateString());
    setNotes(item.notes || '');
    setSourceType(item.sourceType || 'received');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openAddMoreModal = (item: HeldItem) => {
    setItemToAddMore(item);
    setAddAmountInput('');
    setAddDateInput(getTodayDateString());
    setAddNotesInput('');
    setAddSourceType(item.sourceType || 'received');
    setAddAmountError(null);
  };

  const handleConfirmAddMore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToAddMore) return;

    const numAdd = Number(addAmountInput);
    if (isNaN(numAdd) || numAdd <= 0) {
      setAddAmountError(`Please enter a valid amount greater than 0 ${currencyCode}.`);
      return;
    }

    const newTotal = Number(itemToAddMore.amount) + numAdd;
    const additionalNote = addNotesInput.trim();
    const sourceLabel = addSourceType === 'already_held' ? 'From Owned Money' : 'Received as Asset';
    let updatedNotes = itemToAddMore.notes || '';
    const depositLog = `[+${formatCurrency(numAdd, currencyCode)} on ${addDateInput || getTodayDateString()} (${sourceLabel})]: ${additionalNote || 'Deposit'}`;
    updatedNotes = updatedNotes ? `${updatedNotes}\n${depositLog}` : depositLog;

    onSaveHeldItem({
      ...itemToAddMore,
      amount: newTotal,
      isReturned: false,
      returnedDate: undefined,
      notes: updatedNotes,
    }, numAdd, addSourceType);

    setItemToAddMore(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) {
      setFormError('Please enter a name or description for whom you are holding money.');
      return;
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid positive amount.');
      return;
    }

    onSaveHeldItem({
      id: editingItem?.id,
      personName: personName.trim(),
      amount: numAmount,
      currency: currencyCode,
      date: date || getTodayDateString(),
      isReturned: editingItem ? editingItem.isReturned : false,
      returnedDate: editingItem?.returnedDate,
      notes: notes.trim(),
      sourceType: sourceType,
    });

    setIsModalOpen(false);
  };

  const confirmReturnedAction = () => {
    if (itemToConfirmReturned) {
      onToggleReturned(itemToConfirmReturned.id);
      setItemToConfirmReturned(null);
    }
  };

  const openReturnModal = (item: HeldItem) => {
    setItemToReturnAmount(item);
    setReturnAmountInput('');
    setReturnAmountError(null);
  };

  const handleConfirmPartialReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToReturnAmount) return;

    const numReturn = Number(returnAmountInput);
    if (isNaN(numReturn) || numReturn <= 0) {
      setReturnAmountError(`Please enter a valid amount greater than 0 ${currencyCode}.`);
      return;
    }

    if (numReturn > itemToReturnAmount.amount) {
      setReturnAmountError(`Returned amount cannot exceed currently held amount of ${formatCurrency(itemToReturnAmount.amount, currencyCode)}.`);
      return;
    }

    const remaining = Math.max(0, itemToReturnAmount.amount - numReturn);
    onSaveHeldItem({
      ...itemToReturnAmount,
      amount: remaining,
      isReturned: remaining === 0 ? true : itemToReturnAmount.isReturned,
      returnedDate: remaining === 0 ? getTodayDateString() : itemToReturnAmount.returnedDate,
    });

    setItemToReturnAmount(null);
  };

  const cardBg = isDark
    ? 'bg-slate-900 border-slate-800 text-white'
    : 'bg-white border-slate-200/80 text-slate-900';

  const subTextColor = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-12">
      {/* Top Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 text-white p-5 sm:p-6 shadow-xl border border-indigo-900/50">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <HandCoins className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                MONEY HELD FOR OTHERS
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-indigo-300 mt-2">
              {formatCurrency(totalActiveHeldAmount, currencyCode)}
            </h2>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5 font-medium">
              <span>Included in total funds pool, but categorised as non-owned money.</span>
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Held Money</span>
          </button>
        </div>

        {/* Stats row */}
        <div className="mt-4 pt-3 border-t border-indigo-900/40 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-indigo-900/30 border border-indigo-800/40 rounded-xl p-2.5 flex items-center justify-between">
            <span className="text-slate-300 text-[11px] font-semibold">Active Unreturned</span>
            <span className="font-extrabold text-indigo-200 bg-indigo-500/20 px-2 py-0.5 rounded-lg border border-indigo-500/30">
              {activeHeldItems.length} {activeHeldItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-2.5 flex items-center justify-between">
            <span className="text-slate-300 text-[11px] font-semibold">Completed & Returned</span>
            <span className="font-extrabold text-slate-300 bg-slate-700/50 px-2 py-0.5 rounded-lg">
              {returnedHeldItems.length} {returnedHeldItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Swipe Hint */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center bg-slate-200 dark:bg-slate-800/80 p-1 rounded-xl space-x-1 border border-slate-300 dark:border-slate-700/60 w-fit">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({heldItems.length})
          </button>
          <button
            onClick={() => setActiveFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeFilter === 'active'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Holding ({activeHeldItems.length})
          </button>
          <button
            onClick={() => setActiveFilter('returned')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeFilter === 'returned'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Returned ({returnedHeldItems.length})
          </button>
        </div>
      </div>

      {/* Held Money Cards List */}
      {filteredItems.length === 0 ? (
        <div className={`p-8 rounded-2xl border text-center ${cardBg}`}>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 mx-auto flex items-center justify-center mb-3">
            <HandCoins className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold mb-1">No money held entries found</h3>
          <p className={`text-xs ${subTextColor} max-w-sm mx-auto mb-4`}>
            {activeFilter === 'returned'
              ? 'You have not returned any held money entries yet.'
              : 'Add money you are holding on behalf of friends, colleagues, or family.'}
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Entry</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => {
            return (
              <SwipeableRow
                key={item.id}
                isDark={isDark}
                onEdit={item.isReturned ? undefined : () => openEditModal(item)}
                onDelete={() => setItemToDelete(item)}
              >
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all shadow-xs flex items-center justify-between gap-3 ${
                    item.isReturned
                      ? isDark
                        ? 'bg-slate-900/60 border-slate-800 text-slate-400 opacity-75'
                        : 'bg-slate-100/90 border-slate-300 text-slate-600 opacity-80'
                      : 'hover:border-indigo-500/40 ' + cardBg
                  }`}
                >
                  {/* Left: Icon, Name (fully visible, wrapping without overlap) & Amount */}
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        item.isReturned
                          ? 'bg-slate-200/80 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                          : 'bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500/30 text-indigo-500'
                      }`}
                    >
                      <HandCoins className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1 pr-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4
                          className={`text-sm sm:text-base font-extrabold break-words leading-tight ${
                            item.isReturned
                              ? 'text-slate-600 dark:text-slate-300'
                              : ''
                          }`}
                        >
                          {item.personName}
                        </h4>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border inline-flex items-center gap-1 ${
                          item.sourceType === 'already_held'
                            ? isDark
                              ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : isDark
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {item.sourceType === 'already_held' ? (
                            <>
                              <Wallet className="w-2.5 h-2.5" />
                              <span>From Owned</span>
                            </>
                          ) : (
                            <>
                              <ArrowDownLeft className="w-2.5 h-2.5" />
                              <span>Received Asset</span>
                            </>
                          )}
                        </span>
                      </div>
                      <div
                        className={`text-xs sm:text-sm font-black font-mono mt-1 ${
                          item.isReturned
                            ? 'text-slate-500 dark:text-slate-400'
                            : 'text-indigo-600 dark:text-indigo-400'
                        }`}
                      >
                        {formatCurrency(item.amount, currencyCode)}
                      </div>
                    </div>
                  </div>

                  {/* Right side: Action buttons stacked on top of each other */}
                  <div className="flex flex-col gap-1.5 items-end justify-center shrink-0">
                    {item.isReturned ? (
                      <>
                        <span className="inline-flex items-center justify-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                          <Check className="w-3 h-3 stroke-[2.5]" /> Returned
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openAddMoreModal(item)}
                            className="px-2 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer hover:bg-indigo-500/20 whitespace-nowrap"
                            title="Add more funds / reopen this held money entry"
                          >
                            <Plus className="w-3 h-3 stroke-[2.5]" />
                            <span>Add More</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleReturned(item.id)}
                            className="p-1 text-slate-400 hover:text-slate-200 bg-slate-200/50 dark:bg-slate-800 rounded-lg transition cursor-pointer"
                            title="Mark as unreturned / reopen"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => openAddMoreModal(item)}
                          className={`w-full px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center justify-center gap-1 transition shadow-xs active:scale-95 cursor-pointer whitespace-nowrap ${
                            isDark
                              ? 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40'
                              : 'bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600'
                          }`}
                          title="Add more money to this person's held balance"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                          <span>Add More</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openReturnModal(item)}
                          className="w-full px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-extrabold flex items-center justify-center gap-1 shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
                          title="Return money to owner"
                        >
                          <RotateCcw className="w-3 h-3 stroke-[2.5]" />
                          <span>Return</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </SwipeableRow>
            );
          })}
        </div>
      )}

      {/* Modal for Adding More Money to a Held Item */}
      {itemToAddMore && (
        <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-sm rounded-2xl border shadow-2xl p-5 space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Add to Money Held
                  </h3>
                  <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {itemToAddMore.personName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setItemToAddMore(null)}
                className={`p-1 rounded-lg cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Source of Added Funds */}
            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Source of Added Money <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Option 1: Received from Person */}
                <button
                  type="button"
                  onClick={() => setAddSourceType('received')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    addSourceType === 'received'
                      ? isDark
                        ? 'bg-emerald-500/15 border-emerald-500 text-white ring-1 ring-emerald-500/50'
                        : 'bg-emerald-50/80 border-emerald-500 text-slate-900 ring-1 ring-emerald-500'
                      : isDark
                        ? 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <ArrowDownLeft className={`w-3.5 h-3.5 ${addSourceType === 'received' ? 'text-emerald-500' : 'text-slate-400'}`} />
                      Received from Person
                    </span>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                      addSourceType === 'received'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}>
                      New Asset
                    </span>
                  </div>
                  <p className={`text-[10px] leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Received from {itemToAddMore.personName}. Added to your total funds pool.
                  </p>
                </button>

                {/* Option 2: Already with Me */}
                <button
                  type="button"
                  onClick={() => setAddSourceType('already_held')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    addSourceType === 'already_held'
                      ? isDark
                        ? 'bg-indigo-500/15 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                        : 'bg-indigo-50/80 border-indigo-500 text-slate-900 ring-1 ring-indigo-500'
                      : isDark
                        ? 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Wallet className={`w-3.5 h-3.5 ${addSourceType === 'already_held' ? 'text-indigo-500' : 'text-slate-400'}`} />
                      Already with Me
                    </span>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                      addSourceType === 'already_held'
                        ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}>
                      From Owned
                    </span>
                  </div>
                  <p className={`text-[10px] leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Money you already had. Pulled from your owned balance.
                  </p>
                </button>
              </div>
            </div>

            {/* Live Calculation Preview Card */}
            <div className={`p-3 rounded-xl border space-y-2 text-xs ${
              isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Current Held Balance:</span>
                <span className={`font-bold font-mono ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {formatCurrency(itemToAddMore.amount, currencyCode)}
                </span>
              </div>
              {Number(addAmountInput) > 0 && (
                <>
                  <div className="flex items-center justify-between text-indigo-500 font-semibold">
                    <span>+ Adding ({addSourceType === 'already_held' ? 'From Owned Money' : 'Received as Asset'}):</span>
                    <span className="font-mono font-bold">
                      +{formatCurrency(Number(addAmountInput), currencyCode)}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-700/40 dark:border-slate-700/60 flex items-center justify-between font-extrabold">
                    <span className={isDark ? 'text-white' : 'text-slate-900'}>New Total Held:</span>
                    <span className="text-sm font-mono text-indigo-600 dark:text-indigo-300">
                      {formatCurrency(Number(itemToAddMore.amount) + Number(addAmountInput), currencyCode)}
                    </span>
                  </div>

                  {/* Impact on owned balance */}
                  <div className={`pt-1.5 border-t text-xs ${
                    addSourceType === 'already_held'
                      ? isDark ? 'border-indigo-900/60 text-indigo-300' : 'border-indigo-100 text-indigo-800'
                      : isDark ? 'border-emerald-900/60 text-emerald-300' : 'border-emerald-100 text-emerald-800'
                  }`}>
                    {addSourceType === 'already_held' ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between font-semibold">
                          <span>Owned Balance Impact:</span>
                          <span className="font-mono font-bold">
                            {formatCurrency(ownedBalance, currencyCode)} → {formatCurrency(ownedBalance - Number(addAmountInput), currencyCode)}
                          </span>
                        </div>
                        {Number(addAmountInput) > ownedBalance && (
                          <p className="text-[11px] text-amber-500 font-semibold">
                            ⚠️ Note: Exceeds currently owned balance ({formatCurrency(ownedBalance, currencyCode)}).
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between font-semibold">
                        <span>Owned Balance:</span>
                        <span className="font-semibold">Unchanged ({formatCurrency(ownedBalance, currencyCode)})</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <form onSubmit={handleConfirmAddMore} className="space-y-3">
              {addAmountError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-500 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addAmountError}</span>
                </div>
              )}

              {/* Amount Input */}
              <div>
                <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Additional Amount ({currencyCode}) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  autoFocus
                  placeholder="e.g. 50"
                  value={addAmountInput}
                  onChange={(e) => setAddAmountInput(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Quick Amount Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[50, 100, 200, 500, 1000].map((quickVal) => (
                  <button
                    key={quickVal}
                    type="button"
                    onClick={() => {
                      const currentVal = Number(addAmountInput) || 0;
                      setAddAmountInput(String(currentVal + quickVal));
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-indigo-700 border border-slate-200'
                    }`}
                  >
                    +{quickVal}
                  </button>
                ))}
              </div>

              {/* Date Added */}
              <div>
                <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Date Received
                </label>
                <PrettyDatePicker
                  value={addDateInput}
                  onChange={(val) => setAddDateInput(val)}
                  isDark={isDark}
                />
              </div>

              {/* Optional Notes */}
              <div>
                <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Second installment / extra cash"
                  value={addNotesInput}
                  onChange={(e) => setAddNotesInput(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Action Buttons */}
              <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setItemToAddMore(null)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl cursor-pointer transition ${
                    isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add to Balance</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Returning Specific Amount */}
      {itemToReturnAmount && (
        <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-sm rounded-2xl border shadow-2xl p-5 space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  <HandCoins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Return Money
                  </h3>
                  <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {itemToReturnAmount.personName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setItemToReturnAmount(null)}
                className={`p-1 rounded-lg cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Current Held Balance:</span>
              <span className="font-extrabold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                {formatCurrency(itemToReturnAmount.amount, currencyCode)}
              </span>
            </div>

            <form onSubmit={handleConfirmPartialReturn} className="space-y-3">
              {returnAmountError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-500 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{returnAmountError}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Amount Returned ({currencyCode}) <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setReturnAmountInput(String(itemToReturnAmount.amount))}
                    className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Return Full Amount
                  </button>
                </div>
                <input
                  type="number"
                  step="any"
                  required
                  autoFocus
                  placeholder={`e.g. 100`}
                  value={returnAmountInput}
                  onChange={(e) => setReturnAmountInput(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setItemToReturnAmount(null)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl cursor-pointer transition ${
                    isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSaveHeldItem({
                        ...itemToReturnAmount,
                        amount: 0,
                        isReturned: true,
                        returnedDate: getTodayDateString(),
                      });
                      setItemToReturnAmount(null);
                    }}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Return All</span>
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Returned Status */}
      {itemToConfirmReturned && (
        <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-sm rounded-2xl border shadow-2xl p-5 space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
              }`}>
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Confirm Returned Money
                </h3>
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {itemToConfirmReturned.personName}
                </p>
              </div>
            </div>

            <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              Are you sure you returned <strong className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>{formatCurrency(itemToConfirmReturned.amount, currencyCode)}</strong> to <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>{itemToConfirmReturned.personName}</strong>?
            </p>

            <div className={`flex items-center justify-end space-x-2 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                type="button"
                onClick={() => setItemToConfirmReturned(null)}
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
                onClick={confirmReturnedAction}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Yes, Mark Returned</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Deletion */}
      {itemToDelete && (
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
                  Confirm Deletion
                </h3>
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {itemToDelete.personName}
                </p>
              </div>
            </div>

            <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              Are you sure you want to delete this held money entry for <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>{itemToDelete.personName}</strong> (<strong className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>{formatCurrency(itemToDelete.amount, currencyCode)}</strong>)?
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
                  onDeleteHeldItem(itemToDelete.id);
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

      {/* Add / Edit Held Money Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <HandCoins className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold">
                  {editingItem ? 'Edit Money Held' : 'Add Money Held for Someone'}
                </h3>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 pb-24 sm:pb-6 overflow-y-auto space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Person Name / Label */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Name / Reason <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John, Alex's Deposit, Sarah"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Funds Source Selection */}
              <div>
                <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Funds Source <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Option 1: Received from Person */}
                  <button
                    type="button"
                    onClick={() => setSourceType('received')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      sourceType === 'received'
                        ? isDark
                          ? 'bg-emerald-500/15 border-emerald-500 text-white ring-1 ring-emerald-500/50'
                          : 'bg-emerald-50/80 border-emerald-500 text-slate-900 ring-1 ring-emerald-500'
                        : isDark
                          ? 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <ArrowDownLeft className={`w-4 h-4 ${sourceType === 'received' ? 'text-emerald-500' : 'text-slate-400'}`} />
                        Received from Person
                      </span>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        sourceType === 'received'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}>
                        New Asset
                      </span>
                    </div>
                    <p className={`text-[11px] leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Cash or transfer received from them. Added to your total assets pool.
                    </p>
                  </button>

                  {/* Option 2: Already with Me */}
                  <button
                    type="button"
                    onClick={() => setSourceType('already_held')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      sourceType === 'already_held'
                        ? isDark
                          ? 'bg-indigo-500/15 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                          : 'bg-indigo-50/80 border-indigo-500 text-slate-900 ring-1 ring-indigo-500'
                        : isDark
                          ? 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Wallet className={`w-4 h-4 ${sourceType === 'already_held' ? 'text-indigo-500' : 'text-slate-400'}`} />
                        Already with Me
                      </span>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        sourceType === 'already_held'
                          ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}>
                        From Owned
                      </span>
                    </div>
                    <p className={`text-[11px] leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Money you already had with you. Pulled from your owned money (no new asset).
                    </p>
                  </button>
                </div>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Amount ({currencyCode}) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Date Started
                  </label>
                  <PrettyDatePicker
                    value={date}
                    onChange={(val) => setDate(val)}
                    isDark={isDark}
                  />
                </div>
              </div>

              {/* Live Balance Impact Preview */}
              {Number(amount) > 0 && (
                <div className={`p-3 rounded-xl border space-y-1.5 text-xs ${
                  sourceType === 'already_held'
                    ? isDark ? 'bg-indigo-950/30 border-indigo-800/50 text-indigo-200' : 'bg-indigo-50 border-indigo-200 text-indigo-950'
                    : isDark ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}>
                  {sourceType === 'already_held' ? (
                    <>
                      <div className="flex items-center justify-between font-semibold">
                        <span>Current Owned Balance:</span>
                        <span className="font-mono font-bold">{formatCurrency(ownedBalance, currencyCode)}</span>
                      </div>
                      <div className="flex items-center justify-between text-indigo-500 dark:text-indigo-400">
                        <span>- Pulling to Hold:</span>
                        <span className="font-mono font-bold">-{formatCurrency(Number(amount), currencyCode)}</span>
                      </div>
                      <div className="pt-1.5 border-t border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between font-bold">
                        <span>Remaining Owned Balance:</span>
                        <span className={`font-mono ${
                          ownedBalance - Number(amount) < 0 ? 'text-rose-500' : ''
                        }`}>
                          {formatCurrency(ownedBalance - Number(amount), currencyCode)}
                        </span>
                      </div>
                      {Number(amount) > ownedBalance && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold pt-0.5">
                          ⚠️ Note: This amount exceeds your current owned balance.
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between font-semibold">
                        <span>Total Assets Impact:</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          +{formatCurrency(Number(amount), currencyCode)} (New Asset Added)
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span>Your Owned Balance:</span>
                        <span>Unchanged ({formatCurrency(ownedBalance, currencyCode)})</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Notes / Details (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional details about the held money..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? 'Update Entry' : 'Save Held Money'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
