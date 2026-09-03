import React, { useState } from 'react';
import { Target, Plus, Trash2, Calendar, PiggyBank, Sparkles, CheckCircle2, Clock, X, DollarSign, TrendingUp, Edit3 } from 'lucide-react';
import { GoalItem, CategoryType } from '../types';
import { formatCurrency, getTodayDateString } from '../utils/formatters';
import { PrettyDatePicker } from './PrettyDatePicker';

interface GoalsViewProps {
  goals: GoalItem[];
  currencyCode: string;
  isDark?: boolean;
  onSaveGoal: (goal: Omit<GoalItem, 'id' | 'createdAt'> & { id?: string }) => void;
  onDeleteGoal: (id: string) => void;
  onUpdateDeposit?: (goalId: string, addedAmount: number) => void;
  onSaveExpense?: (expense: {
    amount: number;
    category: CategoryType;
    entry_date: string;
    notes?: string;
    goalId?: string;
  }) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  currencyCode,
  isDark = false,
  onSaveGoal,
  onDeleteGoal,
  onUpdateDeposit,
  onSaveExpense,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState('0');
  const [startDate, setStartDate] = useState(getTodayDateString());
  // Default end date to 30 days from today
  const defaultEndDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };
  const [endDate, setEndDate] = useState(defaultEndDate());
  const [notes, setNotes] = useState('');

  // Deposit modal state
  const [depositGoal, setDepositGoal] = useState<GoalItem | null>(null);
  const [depositInput, setDepositInput] = useState('');

  // Delete confirmation state
  const [goalToDelete, setGoalToDelete] = useState<GoalItem | null>(null);

  const handleOpenAddModal = () => {
    setEditingGoal(null);
    setName('');
    setTargetAmount('');
    setSavedAmount('0');
    setStartDate(getTodayDateString());
    setEndDate(defaultEndDate());
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (goal: GoalItem) => {
    if (goal.savedAmount >= goal.targetAmount) return;
    setEditingGoal(goal);
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setSavedAmount(goal.savedAmount.toString());
    setStartDate(goal.startDate);
    setEndDate(goal.endDate);
    setNotes(goal.notes || '');
    setIsModalOpen(true);
  };

  // Helper for daily required calculations
  const calculateDailyRequirement = (target: number, start: string, end: string) => {
    if (!target || target <= 0 || !start || !end) return { totalDays: 0, dailyTarget: 0 };
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const diffMs = e - s;
    const totalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const dailyTarget = target / totalDays;
    return { totalDays, dailyTarget };
  };

  const currentCalc = calculateDailyRequirement(
    parseFloat(targetAmount) || 0,
    startDate,
    endDate
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericTarget = parseFloat(targetAmount);
    const numericSaved = parseFloat(savedAmount) || 0;
    if (!name.trim() || isNaN(numericTarget) || numericTarget <= 0) return;

    onSaveGoal({
      id: editingGoal?.id,
      name: name.trim(),
      targetAmount: numericTarget,
      savedAmount: numericSaved,
      startDate: startDate || getTodayDateString(),
      endDate: endDate || defaultEndDate(),
      notes: notes.trim(),
    });

    // Automatically log added initial savings as a Savings expense
    if (onSaveExpense && numericSaved > 0 && (!editingGoal || numericSaved > editingGoal.savedAmount)) {
      const addedAmount = editingGoal ? numericSaved - editingGoal.savedAmount : numericSaved;
      onSaveExpense({
        amount: addedAmount,
        category: 'Savings',
        entry_date: startDate || getTodayDateString(),
        notes: `Savings allocated to goal: ${name.trim()}`,
        goalId: editingGoal?.id,
      });
    }

    setIsModalOpen(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoal) return;
    const added = parseFloat(depositInput);
    if (isNaN(added) || added <= 0) return;

    if (onUpdateDeposit) {
      onUpdateDeposit(depositGoal.id, added);
    } else {
      onSaveGoal({
        ...depositGoal,
        savedAmount: depositGoal.savedAmount + added,
      });
    }

    // Automatically log this goal deposit as a Savings expense
    if (onSaveExpense) {
      onSaveExpense({
        amount: added,
        category: 'Savings',
        entry_date: getTodayDateString(),
        notes: `Goal Deposit: ${depositGoal.name}`,
        goalId: depositGoal.id,
      });
    }

    setDepositGoal(null);
    setDepositInput('');
  };

  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.savedAmount, 0);
  const activeGoalsCount = goals.filter((g) => g.savedAmount < g.targetAmount).length;
  const completedGoalsCount = goals.filter((g) => g.savedAmount >= g.targetAmount).length;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Banner & Stats */}
      <div className={`p-5 rounded-2xl border shadow-lg ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Savings Goals</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Plan purchases and track your calculated daily savings target
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Goal</span>
          </button>
        </div>

        {/* Summary Stats Row */}
        {goals.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/20">
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200/80'}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Savings Target</p>
              <p className="text-sm sm:text-base font-black text-emerald-500 mt-0.5">
                {formatCurrency(totalTarget, currencyCode)}
              </p>
            </div>

            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200/80'}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Saved So Far</p>
              <p className="text-sm sm:text-base font-black text-blue-500 mt-0.5">
                {formatCurrency(totalSaved, currencyCode)}
              </p>
            </div>

            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200/80'}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Items</p>
              <p className="text-sm sm:text-base font-black text-amber-500 mt-0.5">
                {activeGoalsCount} {activeGoalsCount === 1 ? 'Goal' : 'Goals'}
              </p>
            </div>

            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200/80'}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completed Items</p>
              <p className="text-sm sm:text-base font-black text-emerald-500 mt-0.5">
                {completedGoalsCount} {completedGoalsCount === 1 ? 'Goal' : 'Goals'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Goals Grid List */}
      {goals.length === 0 ? (
        <div className={`p-8 text-center rounded-2xl border ${
          isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3">
            <PiggyBank className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-slate-200 mb-1">No Savings Goals Yet</h3>
          <p className="text-xs max-w-xs mx-auto mb-4 text-slate-400">
            Set a target item you want to purchase, specify start/end dates, and let the app calculate your daily required savings!
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md hover:bg-emerald-400 transition cursor-pointer"
          >
            + Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const { totalDays, dailyTarget } = calculateDailyRequirement(
              goal.targetAmount,
              goal.startDate,
              goal.endDate
            );

            const progressPct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
            const remainingNeeded = Math.max(0, goal.targetAmount - goal.savedAmount);

            // Calculate remaining days from today
            const todayMs = new Date().setHours(0, 0, 0, 0);
            const endMs = new Date(goal.endDate).setHours(0, 0, 0, 0);
            const remainingDays = Math.max(1, Math.ceil((endMs - todayMs) / (1000 * 60 * 60 * 24)));
            const remainingDailyRequired = remainingNeeded / remainingDays;

            const isCompleted = goal.savedAmount >= goal.targetAmount;

            return (
              <div
                key={goal.id}
                className={`p-5 rounded-2xl border shadow-md flex flex-col justify-between transition group relative ${
                  isCompleted
                    ? isDark
                      ? 'bg-slate-900/60 border-slate-800 text-slate-400 opacity-75'
                      : 'bg-slate-100/90 border-slate-300 text-slate-600 opacity-80'
                    : isDark
                      ? 'bg-slate-900 border-slate-800 text-white hover:border-emerald-500/50'
                      : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-500/50'
                }`}
              >
                <div>
                  {/* Top Row: Title & Action Buttons */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <PiggyBank className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <h3 className={`text-sm font-extrabold truncate leading-tight ${
                          isCompleted
                            ? 'text-slate-600 dark:text-slate-300'
                            : ''
                        }`}>{goal.name}</h3>
                        <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Target: <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(goal.targetAmount, currencyCode)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        disabled={isCompleted}
                        onClick={() => !isCompleted && handleOpenEditModal(goal)}
                        title={isCompleted ? 'Completed goals cannot be edited' : 'Edit Goal'}
                        className={`p-1.5 rounded-lg transition ${
                          isCompleted
                            ? 'opacity-30 cursor-not-allowed text-slate-400'
                            : isDark
                            ? 'text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer'
                        }`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setGoalToDelete(goal)}
                        title="Delete Goal"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 my-3">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Saved Progress</span>
                      <span className="text-emerald-400">{progressPct}% ({formatCurrency(goal.savedAmount, currencyCode)})</span>
                    </div>
                    <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Calculated Daily Target Box (CRITICAL REQUIREMENT) */}
                  <div className={`p-3 rounded-xl border my-3 space-y-1.5 ${
                    isDark ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-black">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Daily Saving Target:</span>
                      </span>
                      <span className="font-mono text-sm font-extrabold text-emerald-400">
                        {formatCurrency(dailyTarget, currencyCode)} / day
                      </span>
                    </div>

                    <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between pt-1 border-t border-emerald-500/20">
                      <span>Total Timeframe ({totalDays} days):</span>
                      <span className="font-bold text-slate-300">
                        {goal.startDate} → {goal.endDate}
                      </span>
                    </div>

                    {!isCompleted && remainingNeeded > 0 && (
                      <div className="text-[11px] font-bold text-amber-400 flex items-center justify-between">
                        <span>Remaining ({remainingDays} days left):</span>
                        <span className="font-mono font-black">
                          {formatCurrency(remainingDailyRequired, currencyCode)} / day
                        </span>
                      </div>
                    )}
                  </div>

                  {goal.notes && (
                    <p className={`text-xs italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      "{goal.notes}"
                    </p>
                  )}
                </div>

                {/* Bottom Deposit CTA */}
                <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between gap-2">
                  <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isCompleted ? 'Goal Achieved! 🎉' : `Needed: ${formatCurrency(remainingNeeded, currencyCode)}`}
                  </span>

                  <button
                    onClick={() => {
                      setDepositGoal(goal);
                      setDepositInput('');
                    }}
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Savings</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">
                    {editingGoal ? 'Edit Savings Goal' : 'Add New Purchase Goal'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Calculate your required daily savings automatically
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 pb-24 sm:pb-6 overflow-y-auto space-y-4">
              {/* Item Name */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Thing you wish to buy *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PlayStation 5, Laptop, New Phone..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Amounts Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Target Amount ({currencyCode}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 25000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Saved Already ({currencyCode})
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    value={savedAmount}
                    onChange={(e) => setSavedAmount(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Dates Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Start Saving Date *
                  </label>
                  <PrettyDatePicker
                    value={startDate}
                    onChange={(val) => setStartDate(val)}
                    isDark={isDark}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Target End Date *
                  </label>
                  <PrettyDatePicker
                    value={endDate}
                    onChange={(val) => setEndDate(val)}
                    isDark={isDark}
                  />
                </div>
              </div>

              {/* Live Daily Requirement Calculation Preview */}
              {currentCalc.totalDays > 0 && currentCalc.dailyTarget > 0 && (
                <div className={`p-3.5 rounded-xl border space-y-1 ${
                  isDark ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Calculated Daily Saving Goal</span>
                  </p>
                  <p className="text-base font-black text-emerald-400">
                    {formatCurrency(currentCalc.dailyTarget, currencyCode)} <span className="text-xs font-normal text-slate-300">/ day</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Saving for <span className="font-bold text-white">{currentCalc.totalDays} days</span> between {startDate} and {endDate}.
                  </p>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Store link, color model..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition cursor-pointer active:scale-95"
              >
                {editingGoal ? 'Update Goal' : 'Save New Goal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {depositGoal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden p-5 ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <PiggyBank className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-extrabold">Add Savings to Goal</h3>
              </div>
              <button
                onClick={() => setDepositGoal(null)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Goal: <span className="font-bold text-slate-900 dark:text-white">{depositGoal.name}</span>
            </p>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  Amount Saved Today ({currencyCode})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  autoFocus
                  placeholder="e.g. 500"
                  value={depositInput}
                  onChange={(e) => setDepositInput(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setDepositGoal(null)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Delete Confirmation Modal */}
      {goalToDelete && (
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
                  Confirm Goal Deletion
                </h3>
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {goalToDelete.name}
                </p>
              </div>
            </div>

            <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              Are you sure you want to delete the goal <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>{goalToDelete.name}</strong> ({formatCurrency(goalToDelete.targetAmount, currencyCode)})?
            </p>

            <div className={`flex items-center justify-end space-x-2 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                type="button"
                onClick={() => setGoalToDelete(null)}
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
                  onDeleteGoal(goalToDelete.id);
                  setGoalToDelete(null);
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
