import React, { useState } from 'react';
import { Plus, ArrowDownRight, ArrowUpRight, X } from 'lucide-react';

interface FabClusterProps {
  onOpenLogExpense: () => void;
  onOpenAddFunds: () => void;
}

export const FabCluster: React.FC<FabClusterProps> = ({
  onOpenLogExpense,
  onOpenAddFunds,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 z-40 flex flex-col items-end">
      {/* Expanded Actions Popup Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-xs animate-in fade-in"
          />

          <div className="relative z-40 mb-3 flex flex-col items-end space-y-2.5 animate-in slide-in-from-bottom-3 fade-in duration-200">
            {/* Add Funds Button */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenAddFunds();
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-extrabold shadow-xl shadow-emerald-600/30 flex items-center space-x-2 transition transform active:scale-95 border border-emerald-400/40 cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-700/60 flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <span>Add Asset / Funds</span>
            </button>

            {/* Log Expense Button */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenLogExpense();
              }}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-extrabold shadow-xl shadow-rose-600/30 flex items-center space-x-2 transition transform active:scale-95 border border-rose-400/40 cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-rose-700/60 flex items-center justify-center">
                <ArrowDownRight className="w-3.5 h-3.5" />
              </div>
              <span>Log New Expense</span>
            </button>
          </div>
        </>
      )}

      {/* Main Single Floating Plus Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'Close menu' : 'Add new item'}
        className={`w-13 h-13 rounded-full text-white shadow-2xl flex items-center justify-center transition-all transform active:scale-90 cursor-pointer z-40 border ${
          isOpen
            ? 'bg-slate-800 border-slate-600 rotate-45 scale-105'
            : 'bg-emerald-500 hover:bg-emerald-400 border-emerald-300 shadow-emerald-500/40 hover:scale-105'
        }`}
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>
    </div>
  );
};
