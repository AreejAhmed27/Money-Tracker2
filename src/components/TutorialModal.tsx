import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Wallet,
  PlusCircle,
  PiggyBank,
  HandCoins,
  CreditCard,
  Check,
  Moon,
  Sun,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  MoveRight,
  Calendar,
  Download,
  Upload,
  Smartphone,
} from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Balances & Themes',
    subtitle: 'Track active net balance & visual modes',
    icon: Wallet,
    color: 'emerald',
  },
  {
    id: 'logging',
    title: 'Expenses & Payment Methods',
    subtitle: 'Cash, Cards, Digital Wallets & Categories',
    icon: PlusCircle,
    color: 'blue',
  },
  {
    id: 'calendar',
    title: 'Calendar & Swipe Actions',
    subtitle: 'Daily Totals & Quick Edit / Delete',
    icon: Calendar,
    color: 'teal',
  },
  {
    id: 'goals',
    title: 'Savings Goals Calculator',
    subtitle: 'Fund Goals & Track Milestones',
    icon: PiggyBank,
    color: 'amber',
  },
  {
    id: 'debts',
    title: 'Debts & Installment Plans',
    subtitle: 'Monthly Installments & Settlements',
    icon: CreditCard,
    color: 'rose',
  },
  {
    id: 'held',
    title: 'Money Held for Others',
    subtitle: 'Segregated Non-Owned Funds & Returns',
    icon: HandCoins,
    color: 'indigo',
  },
  {
    id: 'transfer',
    title: 'Phone-to-Phone Transfer',
    subtitle: '100% Local Storage, Backups & Statements',
    icon: Smartphone,
    color: 'emerald',
  },
];

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  isDark = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Live Demo Interactive States
  const [demoTheme, setDemoTheme] = useState<'dark' | 'light'>('dark');
  const [demoLogSuccess, setDemoLogSuccess] = useState(false);
  const [demoPaymentMethod, setDemoPaymentMethod] = useState('Cash');
  const [demoSwipePosition, setDemoSwipePosition] = useState<number>(0);
  const [demoGoalSaved, setDemoGoalSaved] = useState<number>(350);
  const [demoDebtPaid, setDemoDebtPaid] = useState<number>(400);
  const [demoHeldAmount, setDemoHeldAmount] = useState<number>(150);
  const [demoHeldReturned, setDemoHeldReturned] = useState<boolean>(false);

  // Always reset to step 0 when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setDemoLogSuccess(false);
      setDemoSwipePosition(0);
      setDemoGoalSaved(350);
      setDemoDebtPaid(400);
      setDemoHeldAmount(150);
      setDemoHeldReturned(false);
    }
  }, [isOpen]);

  // Swipe animation loop on calendar/swipe step
  useEffect(() => {
    if (!isOpen) return;
    if (currentStep === 2) {
      const interval = setInterval(() => {
        setDemoSwipePosition((prev) => (prev === 0 ? -85 : 0));
      }, 2400);
      return () => clearInterval(interval);
    }
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const activeStep = TUTORIAL_STEPS[currentStep];
  const StepIcon = activeStep.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col transition-all max-h-[90vh] ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header Banner */}
        <div
          className={`p-5 sm:p-6 border-b relative ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-xl transition cursor-pointer ${
              isDark
                ? 'hover:bg-slate-700 text-slate-300 hover:text-white'
                : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Close Guide"
            aria-label="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 bg-emerald-600 text-white border border-emerald-500">
              <StepIcon className="w-6 h-6" />
            </div>
            <div className="pr-8 min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    isDark
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                </span>
                <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Feature Guide
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight truncate">
                {activeStep.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Modal Body / Live Gesture Demos */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          <p
            className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {activeStep.subtitle}
          </p>

          {/* STEP 1: WELCOME & THEMES */}
          {activeStep.id === 'welcome' && (
            <div className="space-y-3">
              <div
                className={`p-4 rounded-2xl border transition-all shadow-sm ${
                  demoTheme === 'dark'
                    ? 'bg-slate-950 border-slate-700 text-white'
                    : 'bg-slate-100 border-slate-300 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-700/50">
                  <span className="text-xs font-extrabold text-emerald-500 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4" />
                    <span>Live Balance Demo</span>
                  </span>

                  <button
                    onClick={() => setDemoTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-amber-400 border border-slate-600 flex items-center gap-1.5 cursor-pointer text-xs font-black hover:bg-slate-700 transition shadow-xs"
                  >
                    {demoTheme === 'dark' ? (
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                    <span>{demoTheme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
                  </button>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400">
                      Active Net Balance
                    </span>
                    <p className="text-xl font-black font-mono text-emerald-500 mt-0.5">
                      $ 4,250.00
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black shadow-xs">
                    Carried Over
                  </span>
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Track active net balance across any month and year slate. Balances automatically chain from previous months, and you can switch between dark and light appearance anytime.
              </p>
            </div>
          )}

          {/* STEP 2: LOGGING & PAYMENT METHODS */}
          {activeStep.id === 'logging' && (
            <div className="space-y-3">
              <div
                className={`p-4 rounded-2xl border shadow-sm ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Payment Method Selector
                  </span>
                  {demoLogSuccess && (
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Added with {demoPaymentMethod}!
                    </span>
                  )}
                </div>

                {/* Method selector preview */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {['Cash', 'Credit Card', 'InstaPay'].map((pm) => {
                    const isSelected = demoPaymentMethod === pm;
                    return (
                      <button
                        key={pm}
                        type="button"
                        onClick={() => {
                          setDemoPaymentMethod(pm);
                          setDemoLogSuccess(true);
                        }}
                        className={`p-2.5 rounded-xl text-xs font-black border transition text-center cursor-pointer shadow-xs ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : isDark
                            ? 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                            : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {pm}
                      </button>
                    );
                  })}
                </div>

                <div
                  className={`p-3 rounded-xl border flex items-center justify-center ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                  }`}
                >
                  <button
                    onClick={() => setDemoLogSuccess(true)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer text-xs"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Tap to Record Expense</span>
                  </button>
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Log expenses and incoming assets with custom categories and specific payment modes (Cash, Credit Card, Vodafone Cash, InstaPay, etc.). Set a default payment method in Settings for faster logging.
              </p>
            </div>
          )}

          {/* STEP 3: CALENDAR & SWIPE */}
          {activeStep.id === 'calendar' && (
            <div className="space-y-3">
              <div
                className={`p-4 rounded-2xl border shadow-sm ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Swipe to Edit or Delete
                  </span>
                  <span className="text-xs font-black text-teal-600 dark:text-teal-400 flex items-center gap-1">
                    <MoveRight className="w-4 h-4 animate-pulse" /> Swipe Left
                  </span>
                </div>

                {/* Simulated Swipeable Card */}
                <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-700 p-2.5 flex items-center justify-between shadow-xs">
                  <div className="absolute right-0 top-0 bottom-0 flex items-center gap-1.5 pr-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Edit3 className="w-4 h-4" />
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
                      <Trash2 className="w-4 h-4" />
                    </div>
                  </div>

                  <div
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-3 rounded-lg flex items-center justify-between transition-transform duration-500 z-10 cursor-pointer shadow-sm"
                    style={{ transform: `translateX(${demoSwipePosition}px)` }}
                    onClick={() => setDemoSwipePosition((prev) => (prev === 0 ? -85 : 0))}
                  >
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">Supermarket</h4>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Groceries • Card</p>
                    </div>
                    <span className="text-xs font-black font-mono text-rose-600 dark:text-rose-400">-$ 65.00</span>
                  </div>
                </div>

                <div className="mt-2 text-center">
                  <button
                    onClick={() => setDemoSwipePosition((prev) => (prev === 0 ? -85 : 0))}
                    className="text-xs font-black text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    Tap row to preview swipe gesture
                  </button>
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                View daily spending directly on the interactive Calendar. Tap any date to inspect transactions for that day or swipe left on any ledger item to quickly edit or delete.
              </p>
            </div>
          )}

          {/* STEP 4: GOALS */}
          {activeStep.id === 'goals' && (
            <div className="space-y-3">
              <div
                className={`p-4 rounded-2xl border shadow-sm ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    New Laptop Fund
                  </h4>
                  <span className="text-xs font-black font-mono text-amber-600 dark:text-amber-400">
                    ${demoGoalSaved} / $1,000
                  </span>
                </div>

                <div className={`w-full h-3 rounded-full overflow-hidden mb-3 ${isDark ? 'bg-slate-950 border border-slate-700' : 'bg-slate-200 border border-slate-300'}`}>
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (demoGoalSaved / 1000) * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {demoGoalSaved >= 1000 ? '🎉 Goal Completed!' : `${Math.round((demoGoalSaved / 1000) * 100)}% Funded`}
                  </span>

                  <button
                    onClick={() => setDemoGoalSaved((prev) => (prev >= 1000 ? 350 : prev + 150))}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer transition shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Deposit $150</span>
                  </button>
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Set savings goals with target dates. The built-in calculator computes exact daily targets needed to reach your milestone on schedule.
              </p>
            </div>
          )}

          {/* STEP 5: DEBTS */}
          {activeStep.id === 'debts' && (
            <div className="space-y-3">
              <div
                className={`p-4 rounded-2xl border shadow-sm ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Smartphone Installment
                    </h4>
                    <p className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      6 Months Plan • $100/mo
                    </p>
                  </div>
                  <span className="text-xs font-black font-mono text-rose-600 dark:text-rose-400">
                    ${demoDebtPaid} / $600
                  </span>
                </div>

                <div className={`w-full h-3 rounded-full overflow-hidden mb-3 ${isDark ? 'bg-slate-950 border border-slate-700' : 'bg-slate-200 border border-slate-300'}`}>
                  <div
                    className="h-full bg-rose-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (demoDebtPaid / 600) * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {demoDebtPaid >= 600 ? '🎉 Fully Paid Off!' : `$${600 - demoDebtPaid} Remaining`}
                  </span>

                  <button
                    onClick={() => setDemoDebtPaid((prev) => (prev >= 600 ? 100 : prev + 100))}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer transition shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Pay $100 Installment</span>
                  </button>
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Organize personal loans and monthly installments with calculated monthly dues, automatic progress tracking, and 1-tap settlement logging.
              </p>
            </div>
          )}

          {/* STEP 6: MONEY HELD */}
          {activeStep.id === 'held' && (
            <div className="space-y-3">
              <div
                className={`p-4 rounded-2xl border transition shadow-sm ${
                  demoHeldReturned
                    ? isDark
                      ? 'bg-slate-950 border-slate-800 opacity-90'
                      : 'bg-slate-200 border-slate-300 opacity-90'
                    : isDark
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-slate-100 border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4
                      className={`text-sm font-black transition-colors ${
                        demoHeldReturned
                          ? 'line-through text-slate-500'
                          : isDark
                          ? 'text-white'
                          : 'text-slate-900'
                      }`}
                    >
                      Held for Sarah
                    </h4>
                    <p className={`text-sm font-mono font-black mt-0.5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      $ {demoHeldAmount.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setDemoHeldAmount((prev) => prev + 50);
                        setDemoHeldReturned(false);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 shrink-0 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add $50</span>
                    </button>

                    <button
                      onClick={() => setDemoHeldReturned((prev) => !prev)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs ${
                        demoHeldReturned
                          ? 'bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-500'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{demoHeldReturned ? 'Settled' : 'Return'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Keep track of money you are holding on behalf of someone else. Held funds are subtracted from your net wealth to prevent accidentally spending non-owned money.
              </p>
            </div>
          )}

          {/* STEP 7: PHONE TRANSFER & OFFLINE DATA */}
          {activeStep.id === 'transfer' && (
            <div className="space-y-3">
              <div
                className={`p-4 rounded-2xl border shadow-sm ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
                }`}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-blue-600 border border-blue-700 rounded-2xl text-center text-white shadow-sm">
                    <Download className="w-6 h-6 text-white mx-auto mb-1.5" />
                    <p className="text-xs font-black text-white">Export Backup</p>
                    <p className="text-[10px] font-bold text-blue-100 mt-0.5">Save .json file</p>
                  </div>

                  <div className="p-3.5 bg-emerald-600 border border-emerald-700 rounded-2xl text-center text-white shadow-sm">
                    <Upload className="w-6 h-6 text-white mx-auto mb-1.5" />
                    <p className="text-xs font-black text-white">Import on Phone</p>
                    <p className="text-[10px] font-bold text-emerald-100 mt-0.5">Load records</p>
                  </div>
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                All your data is stored locally on your device for fast, private, 100% offline access. When switching to a new phone, simply export your backup file from Settings and import it on the new device!
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div
          className={`p-4 sm:p-5 border-t flex items-center justify-between gap-3 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          {/* Progress Dots */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {TUTORIAL_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentStep === index
                    ? 'w-6 bg-emerald-600'
                    : `w-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'}`
                }`}
                title={`Go to step ${index + 1}`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black border transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                    : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            {currentStep < TUTORIAL_STEPS.length - 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md cursor-pointer whitespace-nowrap"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-2 transition shadow-md cursor-pointer whitespace-nowrap shrink-0"
              >
                <Check className="w-4 h-4 shrink-0 stroke-[3]" />
                <span>Get Started</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
