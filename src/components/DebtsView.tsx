import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { DebtItem } from '../types';
import { formatCurrency, getTodayDateString } from '../utils/formatters';
import { PrettyDatePicker } from './PrettyDatePicker';

interface DebtsViewProps {
  debts: DebtItem[];
  currencyCode?: string;
  isDark?: boolean;
  onSaveDebt: (debt: Omit<DebtItem, 'id' | 'createdAt'> & { id?: string }) => void;
  onDeleteDebt: (id: string) => void;
  onSaveExpense: (expense: {
    transaction_id?: string;
    amount: number;
    category: string;
    entry_date: string;
    notes?: string;
    debtId?: string;
  }) => void;
}

export const DebtsView: React.FC<DebtsViewProps> = ({
  debts,
  currencyCode = 'EGP',
  isDark = false,
  onSaveDebt,
  onDeleteDebt,
  onSaveExpense,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<DebtItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('0');
  const [monthsCount, setMonthsCount] = useState('12');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Quick Payment Modal State
  const [payingDebt, setPayingDebt] = useState<DebtItem | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [debtToDelete, setDebtToDelete] = useState<DebtItem | null>(null);

  const openAddModal = () => {
    setEditingDebt(null);
    setTitle('');
    setTotalAmount('');
    setPaidAmount('0');
    setMonthsCount('12');
    setStartDate(getTodayDateString());
    setNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (debt: DebtItem) => {
    if (debt.paidAmount >= debt.totalAmount) return;
    setEditingDebt(debt);
    setTitle(debt.title);
    setTotalAmount(debt.totalAmount.toString());
    setPaidAmount(debt.paidAmount.toString());
    setMonthsCount(debt.monthsCount.toString());
    setStartDate(debt.startDate || getTodayDateString());
    setNotes(debt.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmitDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(totalAmount);
    const paid = parseFloat(paidAmount || '0');
    const months = parseInt(monthsCount, 10);

    if (!title.trim()) {
      setFormError('Please enter a debt or installment title.');
      return;
    }
    if (isNaN(total) || total <= 0) {
      setFormError('Please enter a valid total amount.');
      return;
    }
    if (isNaN(months) || months <= 0) {
      setFormError('Please enter number of months (at least 1).');
      return;
    }

    onSaveDebt({
      id: editingDebt?.id,
      title: title.trim(),
      totalAmount: total,
      paidAmount: isNaN(paid) ? 0 : paid,
      monthsCount: months,
      startDate: startDate || getTodayDateString(),
      notes: notes.trim(),
    });

    setIsModalOpen(false);
  };

  const handleOpenPayModal = (debt: DebtItem) => {
    setPayingDebt(debt);
    const monthlyRate = Math.round((debt.totalAmount / debt.monthsCount) * 100) / 100;
    const remaining = debt.totalAmount - debt.paidAmount;
    setPaymentAmount(Math.min(monthlyRate, remaining).toString());
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingDebt) return;
    const payNum = parseFloat(paymentAmount);
    if (isNaN(payNum) || payNum <= 0) return;

    onSaveExpense({
      amount: payNum,
      category: 'Debts & Installments',
      entry_date: getTodayDateString(),
      notes: `Installment payment for "${payingDebt.title}"`,
      debtId: payingDebt.id,
    });

    setPayingDebt(null);
  };

  // Metrics
  const totalDebtSum = debts.reduce((sum, d) => sum + Number(d.totalAmount), 0);
  const totalPaidSum = debts.reduce((sum, d) => sum + Number(d.paidAmount), 0);
  const remainingDebtSum = totalDebtSum - totalPaidSum;
  const monthlyDueSum = debts.reduce((sum, d) => {
    const isCompleted = d.paidAmount >= d.totalAmount;
    if (isCompleted) return sum;
    return sum + (d.totalAmount / d.monthsCount);
  }, 0);

  const cardBg = isDark
    ? 'bg-slate-900 border-slate-800 text-white'
    : 'bg-white border-slate-200/80 text-slate-900';

  const modalBg = isDark
    ? 'bg-slate-900 border-slate-800 text-white'
    : 'bg-white border-slate-200/80 text-slate-900';

  const inputBg = isDark
    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400';

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${cardBg} shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight">Debts & Installments</h2>
            <p className="text-xs text-slate-400 font-medium">
              Track loan repayments, active installments & monthly due schedules
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20 transition cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Debt / Installment</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Debts */}
        <div className={`p-3.5 rounded-2xl border ${cardBg} shadow-2xs space-y-1`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Debts</span>
          <p className="text-sm sm:text-base font-black font-mono text-indigo-400">
            {formatCurrency(totalDebtSum, currencyCode)}
          </p>
        </div>

        {/* Total Paid */}
        <div className={`p-3.5 rounded-2xl border ${cardBg} shadow-2xs space-y-1`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Paid</span>
          <p className="text-sm sm:text-base font-black font-mono text-emerald-400">
            {formatCurrency(totalPaidSum, currencyCode)}
          </p>
        </div>

        {/* Remaining Debt */}
        <div className={`p-3.5 rounded-2xl border ${cardBg} shadow-2xs space-y-1`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Remaining Debt</span>
          <p className="text-sm sm:text-base font-black font-mono text-rose-400">
            {formatCurrency(remainingDebtSum, currencyCode)}
          </p>
        </div>

        {/* Monthly Due */}
        <div className={`p-3.5 rounded-2xl border ${cardBg} shadow-2xs space-y-1`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Due</span>
          <p className="text-sm sm:text-base font-black font-mono text-amber-400">
            {formatCurrency(monthlyDueSum, currencyCode)}
          </p>
        </div>
      </div>

      {/* Debts List */}
      <div className="space-y-4">
        {debts.length === 0 ? (
          <div className={`p-10 text-center rounded-2xl border ${cardBg} space-y-3`}>
            <div className="w-12 h-12 rounded-full bg-slate-800/40 text-slate-500 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-300">No debts or installments recorded</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your loans, credit card debts, or monthly item installments to keep track of payments and due dates.
            </p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Installment</span>
            </button>
          </div>
        ) : (
          debts.map((debt) => {
            const monthlyInstallment = debt.monthsCount > 0 ? debt.totalAmount / debt.monthsCount : debt.totalAmount;
            const remaining = Math.max(0, debt.totalAmount - debt.paidAmount);
            const progress = Math.min(100, Math.round((debt.paidAmount / debt.totalAmount) * 100));
            const isCompleted = debt.paidAmount >= debt.totalAmount;
            const paidMonths = Math.min(debt.monthsCount, Math.floor(debt.paidAmount / monthlyInstallment));

            return (
              <div
                key={debt.id}
                className={`p-4 sm:p-5 rounded-2xl border shadow-sm space-y-4 relative overflow-hidden transition ${
                  isCompleted
                    ? isDark
                      ? 'bg-slate-900/60 border-slate-800 text-slate-400 opacity-75'
                      : 'bg-slate-100/90 border-slate-300 text-slate-600 opacity-80'
                    : 'hover:border-indigo-500/40 ' + cardBg
                }`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <h3 className={`text-sm sm:text-base font-extrabold tracking-tight leading-snug break-words ${
                      isCompleted
                        ? 'text-slate-600 dark:text-slate-300'
                        : 'text-slate-900 dark:text-white'
                    }`}>
                      {debt.title}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      {isCompleted ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3" /> Fully Paid
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold shrink-0">
                          {debt.monthsCount} Mos Plan
                        </span>
                      )}

                      {debt.notes && (
                        <span className="text-xs font-medium line-clamp-1 text-slate-500 dark:text-slate-400">
                          {debt.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Top Right Action Toolbar */}
                  <div className={`flex items-center space-x-0.5 shrink-0 p-1 rounded-xl border ${
                    isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <button
                      disabled={isCompleted}
                      onClick={() => !isCompleted && openEditModal(debt)}
                      className={`p-1.5 rounded-lg transition ${
                        isCompleted
                          ? 'opacity-30 cursor-not-allowed text-slate-400'
                          : isDark
                          ? 'text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-white shadow-2xs cursor-pointer'
                      }`}
                      title={isCompleted ? 'Completed debts cannot be edited' : 'Edit'}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDebtToDelete(debt)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/20' : 'text-slate-500 hover:text-rose-600 hover:bg-white shadow-2xs'
                      }`}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Amount Breakdown Banner */}
                <div className={`p-3 rounded-xl border grid grid-cols-3 gap-2 text-center ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Total</span>
                    <span className="text-xs sm:text-sm font-black font-mono text-slate-700 dark:text-slate-300">
                      {formatCurrency(debt.totalAmount, currencyCode)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Paid</span>
                    <span className="text-xs sm:text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(debt.paidAmount, currencyCode)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Remaining</span>
                    <span className={`text-xs sm:text-sm font-black font-mono ${
                      isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {formatCurrency(remaining, currencyCode)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Monthly Rate */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>
                        Monthly Installment:{' '}
                        <strong className="text-indigo-400 font-mono">
                          {formatCurrency(monthlyInstallment, currencyCode)} / mo
                        </strong>
                      </span>
                    </span>
                    <span className="font-extrabold font-mono text-slate-300">{progress}%</span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Months Schedule Preview Grid */}
                <div className="space-y-2 pt-1 border-t border-slate-800/60">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span>Payment Schedule ({debt.monthsCount} Months)</span>
                    <span>{paidMonths} / {debt.monthsCount} Months Paid</span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                    {Array.from({ length: debt.monthsCount }).map((_, idx) => {
                      const mNum = idx + 1;
                      const isMonthPaid = mNum <= paidMonths;
                      const isCurrentDue = mNum === paidMonths + 1 && !isCompleted;

                      return (
                        <div
                          key={mNum}
                          className={`p-1.5 rounded-xl border text-center text-[10px] font-bold transition flex flex-col items-center justify-center gap-0.5 ${
                            isMonthPaid
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                              : isCurrentDue
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/30 animate-pulse'
                              : isDark
                              ? 'bg-slate-800/40 border-slate-800 text-slate-500'
                              : 'bg-slate-100 border-slate-200 text-slate-400'
                          }`}
                        >
                          <span>Mo {mNum}</span>
                          <span className="font-mono text-[9px] font-normal">
                            {isMonthPaid ? '✓ Paid' : isCurrentDue ? 'Due Now' : `${Math.round(monthlyInstallment)} ${currencyCode}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                {!isCompleted && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleOpenPayModal(debt)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-sm transition cursor-pointer active:scale-95"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay Installment ({formatCurrency(monthlyInstallment, currencyCode)})</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Debt Modal Sheet */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity animate-in fade-in">
          <div className={`w-full max-w-lg ${modalBg} rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border max-h-[90vh] flex flex-col`}>
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              isDark ? 'border-slate-800 bg-slate-800/80' : 'border-slate-100 bg-slate-50'
            }`}>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <h3 className="text-base font-bold">
                  {editingDebt ? 'Edit Debt / Installment' : 'Add Debt / Installment'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200/80 hover:bg-slate-300 text-slate-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitDebt} className="p-5 pb-24 sm:pb-6 overflow-y-auto space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                  Title / Item Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., iPhone 15 Pro, Car Loan, Bank Credit Card"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-2.5 ${inputBg} rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500`}
                  autoFocus
                />
              </div>

              {/* Amounts Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                    Total Amount ({currencyCode}) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. 24000"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className={`w-full px-4 py-2.5 ${inputBg} rounded-xl text-sm font-bold font-mono focus:outline-none focus:border-indigo-500`}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                    Already Paid ({currencyCode})
                  </label>
                  <input
                    type="number"
                    step="1"
                    placeholder="0"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className={`w-full px-4 py-2.5 ${inputBg} rounded-xl text-sm font-bold font-mono focus:outline-none focus:border-indigo-500`}
                  />
                </div>
              </div>

              {/* Months Count & Quick Select */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                  Duration (Months) *
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={monthsCount}
                    onChange={(e) => setMonthsCount(e.target.value)}
                    className={`w-24 px-3 py-2 ${inputBg} rounded-xl text-sm font-bold font-mono focus:outline-none focus:border-indigo-500 text-center`}
                  />
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {['3', '6', '12', '18', '24', '36'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMonthsCount(m)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition ${
                          monthsCount === m
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {m} Mos
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                  Start Date
                </label>
                <PrettyDatePicker
                  value={startDate}
                  onChange={(val) => setStartDate(val)}
                  isDark={isDark}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Bank account reference, Store receipt number"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`w-full px-4 py-2.5 ${inputBg} rounded-xl text-xs focus:outline-none focus:border-indigo-500`}
                />
              </div>

              {/* Monthly Installment Calculation Preview Box */}
              {totalAmount && parseFloat(totalAmount) > 0 && monthsCount && parseInt(monthsCount, 10) > 0 && (
                <div className={`p-3.5 rounded-xl border ${
                  isDark ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                } flex items-center justify-between`}>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-indigo-400 block">Calculated Monthly Installment</span>
                    <span className="text-sm font-black font-mono">
                      {formatCurrency(parseFloat(totalAmount) / parseInt(monthsCount, 10), currencyCode)} / month
                    </span>
                  </div>
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold tracking-wide shadow-lg shadow-indigo-600/20 transition active:scale-[0.99] cursor-pointer"
                >
                  {editingDebt ? 'UPDATE DEBT PLAN' : 'SAVE DEBT PLAN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Payment Modal */}
      {payingDebt && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity animate-in fade-in">
          <div className={`w-full max-w-sm ${modalBg} rounded-2xl shadow-2xl overflow-hidden border p-5 space-y-4`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <span>Pay Installment: {payingDebt.title}</span>
              </h3>
              <button
                onClick={() => setPayingDebt(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecutePayment} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">
                  Payment Amount ({currencyCode})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className={`w-full px-4 py-3 ${inputBg} rounded-xl text-xl font-black font-mono focus:outline-none focus:border-emerald-500`}
                  autoFocus
                />
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                This will log an expense under <strong className="text-slate-900 dark:text-white">"Debts & Installments"</strong> for today and update your debt paid balance.
              </p>

              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPayingDebt(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-md transition"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Debt Delete Confirmation Modal */}
      {debtToDelete && (
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
                  Confirm Debt Deletion
                </h3>
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {debtToDelete.title}
                </p>
              </div>
            </div>

            <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              Are you sure you want to delete the entry for <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>{debtToDelete.title}</strong> ({formatCurrency(debtToDelete.totalAmount, currencyCode)})?
            </p>

            <div className={`flex items-center justify-end space-x-2 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                type="button"
                onClick={() => setDebtToDelete(null)}
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
                  onDeleteDebt(debtToDelete.id);
                  setDebtToDelete(null);
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
