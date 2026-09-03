import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroBalanceCard } from './components/HeroBalanceCard';
import { MetricCards } from './components/MetricCards';
import { DonutChart } from './components/DonutChart';
import { BarChart } from './components/BarChart';
import { RecentTransactionsList } from './components/RecentTransactionsList';
import { InteractiveCalendar } from './components/InteractiveCalendar';
import { DayDetailsDrawer } from './components/DayDetailsDrawer';
import { LogExpenseSheet } from './components/LogExpenseSheet';
import { AddAssetSheet } from './components/AddAssetSheet';
import { FabCluster } from './components/FabCluster';
import { BottomNavBar } from './components/BottomNavBar';
import { SettingsView } from './components/SettingsView';
import { ToastNotification } from './components/ToastNotification';
import { CategoriesSidebar } from './components/CategoriesSidebar';
import { GoalsView } from './components/GoalsView';
import { DebtsView } from './components/DebtsView';
import { MoneyHeldView } from './components/MoneyHeldView';

import { CategoryType, AssetItem, DebtItem, ExpenseItem, GoalItem, HeldItem, HeldSourceType, TabType, ThemeMode, UserAccount, TrackerProfile, PaymentMethod } from './types';
import { TutorialModal } from './components/TutorialModal';
import { ManagePaymentMethodsModal } from './components/ManagePaymentMethodsModal';
import {
  getStoredExpenses,
  getStoredAssets,
  getStoredGoals,
  getStoredDebts,
  getStoredHeldItems,
  saveExpenseItem,
  updateExpenseItem,
  deleteExpenseItem,
  saveAssetItem,
  deleteAssetItem,
  saveGoalItem,
  deleteGoalItem,
  saveDebtItem,
  deleteDebtItem,
  saveHeldItem,
  toggleHeldItemReturned,
  deleteHeldItem,
  clearAllData,
  getStoredCurrency,
  saveCurrency,
  getStoredTheme,
  saveTheme,
  getStoredUserAccount,
  saveUserAccount,
  getStoredTrackers,
  getActiveTrackerId,
  setActiveTrackerId,
  saveTracker,
  deleteTracker,
  getStoredPaymentMethods,
  getDefaultPaymentMethodId,
  setDefaultPaymentMethodId,
  savePaymentMethod,
  deletePaymentMethod,
} from './utils/storage';
import {
  calculateCurrentNetBalance,
  calculateDailyTotal,
  calculateMonthlyTotal,
  calculateYTDSummary,
  calculateCategoryBreakdown,
  calculateMonthlyChain,
  getAvailableYears,
} from './utils/calculations';
import { getTodayDateString, formatCurrency, MONTH_NAMES } from './utils/formatters';
import { generateFinanceReportCSV, generateFinanceReportPDF } from './utils/reportGenerator';

import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { syncLocalDataToCloud } from './utils/cloudSync';

export default function App() {
  // Multi-Tracker State
  const [trackers, setTrackers] = useState<TrackerProfile[]>([]);
  const [activeTrackerId, setActiveTrackerIdState] = useState<string>('default');

  // Application State (Scoped to active tracker)
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [heldItems, setHeldItems] = useState<HeldItem[]>([]);
  const [activeMonth, setActiveMonth] = useState<string>(() => MONTH_NAMES[new Date().getMonth()]);
  const [activeYear, setActiveYear] = useState<number>(() => new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [dashboardFocusTrigger, setDashboardFocusTrigger] = useState<number>(0);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (tab === 'dashboard') {
      const now = new Date();
      setActiveMonth(MONTH_NAMES[now.getMonth()]);
      setActiveYear(now.getFullYear());
      setDashboardFocusTrigger((prev) => prev + 1);
    }
  };

  // Preferences & User State
  const [currencyCode, setCurrencyCode] = useState<string>('EGP');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [defaultPaymentMethodId, setDefaultPaymentMethodIdState] = useState<string>('pm-cash');
  const [isManageMethodsOpen, setIsManageMethodsOpen] = useState<boolean>(false);

  // Filters & Modals State
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);

  const [isLogExpenseOpen, setIsLogExpenseOpen] = useState<boolean>(false);
  const [isAddFundsOpen, setIsAddFundsOpen] = useState<boolean>(false);
  const [isCategoriesSidebarOpen, setIsCategoriesSidebarOpen] = useState<boolean>(false);
  const [editingExpenseItem, setEditingExpenseItem] = useState<ExpenseItem | null>(null);
  const [prefilledExpenseDate, setPrefilledExpenseDate] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);

  // Helper to load dataset for a given tracker ID
  const loadTrackerData = (trackerId: string) => {
    setExpenses(getStoredExpenses(trackerId));
    setAssets(getStoredAssets(trackerId));
    setGoals(getStoredGoals(trackerId));
    setDebts(getStoredDebts(trackerId));
    setHeldItems(getStoredHeldItems(trackerId));
  };

  // Initialize data and preferences on mount
  useEffect(() => {
    const loadedTrackers = getStoredTrackers();
    const activeId = getActiveTrackerId();
    setTrackers(loadedTrackers);
    setActiveTrackerIdState(activeId);

    const activeProfile = loadedTrackers.find((t) => t.id === activeId) || loadedTrackers[0];
    const initialCurrency = activeProfile ? activeProfile.currencyCode : getStoredCurrency();
    setCurrencyCode(initialCurrency);

    const now = new Date();
    setActiveMonth(MONTH_NAMES[now.getMonth()]);
    setActiveYear(now.getFullYear());

    loadTrackerData(activeId);

    const storedTheme = getStoredTheme();
    setThemeMode(storedTheme);
    setUserAccount(getStoredUserAccount());
    setPaymentMethods(getStoredPaymentMethods());
    setDefaultPaymentMethodIdState(getDefaultPaymentMethodId());

    // First time open tutorial check
    const hasSeenTutorial = localStorage.getItem('has_seen_app_tutorial_v1');
    if (!hasSeenTutorial) {
      setIsTutorialOpen(true);
    }

    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const cloudUser: UserAccount = {
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          isLoggedIn: true,
          avatarUrl: user.photoURL || undefined,
          joinedDate: user.metadata.creationTime ? new Date(user.metadata.creationTime).toISOString().split('T')[0] : '2026-08-01',
        };
        setUserAccount(cloudUser);
        saveUserAccount(cloudUser);
      }
    });

    return () => unsubscribe();
  }, []);

  // Multi-Tracker Handlers
  const handleSelectTracker = (id: string) => {
    setActiveTrackerId(id);
    setActiveTrackerIdState(id);
    handleTabChange('dashboard');
    setIsCategoriesSidebarOpen(false);
    const target = trackers.find((t) => t.id === id);
    if (target) {
      setCurrencyCode(target.currencyCode);
      saveCurrency(target.currencyCode);
      setToastMessage(`✓ Switched to "${target.name}" (${target.currencyCode})`);
    }
    loadTrackerData(id);
  };

  const handleSaveTracker = (tracker: { id?: string; name: string; currencyCode: string }) => {
    const { trackers: updatedTrackers, activeTracker } = saveTracker(tracker);
    setTrackers(updatedTrackers);
    setActiveTrackerIdState(activeTracker.id);
    setCurrencyCode(activeTracker.currencyCode);
    loadTrackerData(activeTracker.id);
    setToastMessage(`✓ Tracker "${activeTracker.name}" (${activeTracker.currencyCode}) active`);
  };

  const handleDeleteTracker = (id: string) => {
    const target = trackers.find((t) => t.id === id);
    const { trackers: updatedTrackers, nextActiveId } = deleteTracker(id);
    setTrackers(updatedTrackers);
    setActiveTrackerIdState(nextActiveId);
    const nextProfile = updatedTrackers.find((t) => t.id === nextActiveId);
    if (nextProfile) {
      setCurrencyCode(nextProfile.currencyCode);
    }
    loadTrackerData(nextActiveId);
    setToastMessage(`✓ Deleted tracker "${target?.name || ''}"`);
  };

  const handleSaveGoal = (goal: Omit<GoalItem, 'id' | 'createdAt'> & { id?: string }) => {
    const updated = saveGoalItem(goal, activeTrackerId);
    setGoals(updated);
    setToastMessage('✓ Goal saved');
  };

  const handleDeleteGoal = (id: string) => {
    const updated = deleteGoalItem(id, activeTrackerId);
    setGoals(updated);
    setToastMessage('✓ Goal deleted');
  };

  const handleSaveDebt = (debt: Omit<DebtItem, 'id' | 'createdAt'> & { id?: string }) => {
    const updated = saveDebtItem(debt, activeTrackerId);
    setDebts(updated);
    setToastMessage('✓ Debt / Installment saved');
  };

  const handleDeleteDebt = (id: string) => {
    const updated = deleteDebtItem(id, activeTrackerId);
    setDebts(updated);
    setToastMessage('✓ Debt / Installment deleted');
  };

  const handleSaveHeldItem = (
    item: Omit<HeldItem, 'id' | 'createdAt'> & { id?: string; sourceType?: HeldSourceType },
    addedAmount?: number,
    addedSourceType?: HeldSourceType
  ) => {
    const isNew = !item.id;
    const updated = saveHeldItem(item, activeTrackerId);
    setHeldItems(updated);

    if (isNew) {
      if (item.sourceType === 'already_held') {
        // Pulled from owned money: do NOT add an asset.
        // It increases held items, which pulls from ownedNetBalance (currentBalance - totalHeldMoney).
        setToastMessage(`✓ Saved money held (${formatCurrency(item.amount, currencyCode)} pulled from owned funds)`);
      } else {
        // Default / received: adds to assets
        saveAssetItem({
          amount: item.amount,
          source_label: `Money Held (${item.personName})`,
          date_added: item.date || getTodayDateString(),
        }, activeTrackerId);
        setAssets(getStoredAssets(activeTrackerId));
        setToastMessage(`✓ Saved money held (+${formatCurrency(item.amount, currencyCode)} added as asset)`);
      }
    } else if (addedAmount && addedAmount > 0) {
      if (addedSourceType === 'already_held') {
        // Pulled from owned money: do NOT add an asset.
        setToastMessage(`✓ Added ${formatCurrency(addedAmount, currencyCode)} to ${item.personName}'s held money (pulled from owned funds)`);
      } else {
        // Default / received: adds to assets
        saveAssetItem({
          amount: addedAmount,
          source_label: `Money Held Added (${item.personName})`,
          date_added: getTodayDateString(),
        }, activeTrackerId);
        setAssets(getStoredAssets(activeTrackerId));
        setToastMessage(`✓ Added ${formatCurrency(addedAmount, currencyCode)} to ${item.personName}'s held money (+${formatCurrency(addedAmount, currencyCode)} added as asset)`);
      }
    } else {
      setToastMessage('✓ Money held entry updated');
    }
  };

  const handleToggleReturnedHeldItem = (id: string) => {
    const updated = toggleHeldItemReturned(id, getTodayDateString(), activeTrackerId);
    setHeldItems(updated);
    const target = updated.find((h) => h.id === id);
    if (target?.isReturned) {
      setToastMessage(`✓ Marked as returned to ${target.personName}`);
    } else {
      setToastMessage('✓ Reopened held money entry');
    }
  };

  const handleDeleteHeldItem = (id: string) => {
    const updated = deleteHeldItem(id, activeTrackerId);
    setHeldItems(updated);
    setToastMessage('✓ Money held entry deleted');
  };


  const isDark = themeMode === 'dark';

  // Swipe left-to-right to open sidebar, right-to-left to close sidebar
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Ignore vertical swipes or scrolls
      if (Math.abs(deltaY) > Math.abs(deltaX) || Math.abs(deltaY) > 80) return;

      // Swipe right from left area to open sidebar
      if (!isCategoriesSidebarOpen && deltaX > 60 && touchStartX < 160) {
        setIsCategoriesSidebarOpen(true);
      }

      // Swipe left to close sidebar
      if (isCategoriesSidebarOpen && deltaX < -50) {
        setIsCategoriesSidebarOpen(false);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isCategoriesSidebarOpen]);

  // Available years list for multi-year tracking
  const availableYears = getAvailableYears(expenses, assets);

  // Financial Engine Calculations
  const currentNetBalance = calculateCurrentNetBalance(assets, expenses);
  const totalHeldMoney = heldItems
    .filter((h) => !h.isReturned)
    .reduce((sum, h) => sum + (Number(h.amount) || 0), 0);
  const todaySpend = calculateDailyTotal(expenses, getTodayDateString());
  const monthlySpend = calculateMonthlyTotal(expenses, activeMonth, activeYear);
  const ytdSpend = calculateYTDSummary(expenses, activeYear);
  const categoryBreakdown = calculateCategoryBreakdown(expenses, activeMonth, activeYear);
  const monthlyChain = calculateMonthlyChain(assets, expenses, activeYear);

  const currentMonthMetrics = monthlyChain.find(
    (m) => m.month_name.toLowerCase() === activeMonth.toLowerCase()
  );
  const carriedFromPrevMonth = currentMonthMetrics?.starting_balance || 0;
  const monthlySavings = currentMonthMetrics?.total_savings || 0;

  const totalAssetsMonth = assets
    .filter((a) => a.month_name.toLowerCase() === activeMonth.toLowerCase() && a.year === activeYear)
    .reduce((sum, a) => sum + Number(a.amount), 0);

  // Currency & Theme Handlers
  const handleCurrencyChange = (code: string) => {
    setCurrencyCode(code);
    saveCurrency(code);
    setToastMessage(`✓ Currency set to ${code}`);
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    saveTheme(mode);
    setToastMessage(`✓ Theme switched to ${mode} mode`);
  };

  const handleAccountChange = (account: UserAccount | null) => {
    setUserAccount(account);
    saveUserAccount(account);
    if (account) {
      setToastMessage(`✓ Logged in as ${account.name}`);
    } else {
      setToastMessage('✓ Signed out successfully');
    }
  };

  // Report Generation Handlers
  const handleGenerateReportPDF = (period: 'daily' | 'monthly' | 'yearly') => {
    generateFinanceReportPDF({
      expenses,
      assets,
      activeMonth,
      activeYear,
      currencyCode,
      period,
    });
    setToastMessage(`✓ Generating ${period.toUpperCase()} PDF Report...`);
  };

  const handleGenerateReportCSV = (period: 'daily' | 'monthly' | 'yearly') => {
    generateFinanceReportCSV({
      expenses,
      assets,
      activeMonth,
      activeYear,
      currencyCode,
      period,
    });
    setToastMessage(`✓ Downloaded ${period.toUpperCase()} CSV Report`);
  };

  // Payment Methods Handlers
  const handleSavePaymentMethod = (method: Omit<PaymentMethod, 'id' | 'createdAt'> & { id?: string }) => {
    const updated = savePaymentMethod(method);
    setPaymentMethods(updated);
    setDefaultPaymentMethodIdState(getDefaultPaymentMethodId());
    setToastMessage(`✓ Payment method "${method.name}" saved`);
  };

  const handleDeletePaymentMethod = (id: string) => {
    const target = paymentMethods.find((p) => p.id === id);
    const updated = deletePaymentMethod(id);
    setPaymentMethods(updated);
    setDefaultPaymentMethodIdState(getDefaultPaymentMethodId());
    setToastMessage(`✓ Deleted payment method "${target?.name || ''}"`);
  };

  const handleSetDefaultPaymentMethod = (id: string) => {
    setDefaultPaymentMethodId(id);
    setDefaultPaymentMethodIdState(id);
    const updated = getStoredPaymentMethods();
    setPaymentMethods(updated);
    const target = updated.find((p) => p.id === id);
    setToastMessage(`✓ Default payment method set to "${target?.name || 'Cash'}"`);
  };

  // CRUD Handlers
  const handleSaveExpense = (item: {
    transaction_id?: string;
    amount: number;
    category: CategoryType;
    entry_date: string;
    notes?: string;
    paymentMethodId?: string;
    paymentMethodName?: string;
    goalId?: string;
    debtId?: string;
    heldId?: string;
  }) => {
    if (item.transaction_id) {
      const existing = expenses.find((e) => e.transaction_id === item.transaction_id);
      if (existing) {
        const updated = updateExpenseItem({
          ...existing,
          amount: item.amount,
          category: item.category,
          entry_date: item.entry_date,
          notes: item.notes,
          paymentMethodId: item.paymentMethodId ?? existing.paymentMethodId,
          paymentMethodName: item.paymentMethodName ?? existing.paymentMethodName,
          goalId: item.goalId,
          debtId: item.debtId,
          heldId: item.heldId,
        }, activeTrackerId);
        setExpenses(updated);
        setToastMessage('✓ Expense updated');
      }
    } else {
      saveExpenseItem({
        amount: item.amount,
        category: item.category,
        entry_date: item.entry_date,
        notes: item.notes,
        paymentMethodId: item.paymentMethodId,
        paymentMethodName: item.paymentMethodName,
        goalId: item.goalId,
        debtId: item.debtId,
        heldId: item.heldId,
      }, activeTrackerId);
      setExpenses(getStoredExpenses(activeTrackerId));

      // If allocated to a specific savings goal, accumulate it to the goal
      if (item.goalId) {
        const goal = goals.find((g) => g.id === item.goalId);
        if (goal) {
          const updatedGoal = {
            ...goal,
            savedAmount: goal.savedAmount + item.amount,
          };
          const updatedGoalsList = saveGoalItem(updatedGoal, activeTrackerId);
          setGoals(updatedGoalsList);
          setToastMessage(`✓ Savings logged & accumulated to "${goal.name}"!`);
          return;
        }
      }

      // If linked to a debt item, update paid amount on the debt
      if (item.debtId) {
        const debt = debts.find((d) => d.id === item.debtId);
        if (debt) {
          const updatedDebt = {
            ...debt,
            paidAmount: debt.paidAmount + item.amount,
          };
          const updatedDebtsList = saveDebtItem(updatedDebt, activeTrackerId);
          setDebts(updatedDebtsList);
          setToastMessage(`✓ Payment logged & updated balance for "${debt.title}"!`);
          return;
        }
      }

      // If linked to a money held item, subtract returned amount from money held
      if (item.heldId) {
        const heldItem = heldItems.find((h) => h.id === item.heldId);
        if (heldItem) {
          const newRemaining = Math.max(0, heldItem.amount - item.amount);
          const updatedHeld = {
            ...heldItem,
            amount: newRemaining,
            isReturned: newRemaining === 0 ? true : heldItem.isReturned,
            returnedDate: newRemaining === 0 ? item.entry_date : heldItem.returnedDate,
          };
          const updatedHeldList = saveHeldItem(updatedHeld, activeTrackerId);
          setHeldItems(updatedHeldList);
          setToastMessage(`✓ Returned ${formatCurrency(item.amount, currencyCode)} to ${heldItem.personName}!`);
          return;
        }
      }

      setToastMessage('✓ Expense saved');
    }
  };

  const handleSaveAsset = (asset: {
    amount: number;
    source_label: string;
    date_added: string;
    paymentMethodId?: string;
    paymentMethodName?: string;
    notes?: string;
  }) => {
    saveAssetItem({
      amount: asset.amount,
      source_label: asset.source_label,
      date_added: asset.date_added,
      paymentMethodId: asset.paymentMethodId,
      paymentMethodName: asset.paymentMethodName,
      notes: asset.notes,
    }, activeTrackerId);
    setAssets(getStoredAssets(activeTrackerId));
    setToastMessage('✓ Funds added');
  };

  const handleDeleteExpense = (id: string) => {
    const updated = deleteExpenseItem(id, activeTrackerId);
    setExpenses(updated);
    setToastMessage('✓ Expense deleted');
  };

  const handleDeleteAsset = (id: string) => {
    const updated = deleteAssetItem(id, activeTrackerId);
    setAssets(updated);
    setToastMessage('✓ Funds record deleted');
  };

  const handleClearData = () => {
    const { expenses: e, assets: a } = clearAllData(activeTrackerId);
    setExpenses(e);
    setAssets(a);
    setGoals([]);
    setDebts([]);
    setHeldItems([]);
    setToastMessage('✓ All personal data wiped');
  };

  const handleDeleteAccount = () => {
    const guestUser: UserAccount = {
      name: 'Guest User',
      email: 'guest@example.com',
      isLoggedIn: false,
    };
    setUserAccount(guestUser);
    saveUserAccount(guestUser);
    setToastMessage('✓ User account deleted');
  };

  const activeTrackerProfile = trackers.find((t) => t.id === activeTrackerId);

  return (
    <div className={`min-h-screen overflow-x-hidden pb-36 sm:pb-44 font-sans antialiased transition-colors ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Toast feedback banner */}
      <ToastNotification message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Top Application Header */}
      <Header
        activeMonth={activeMonth}
        activeYear={activeYear}
        availableYears={availableYears}
        currencyCode={currencyCode}
        activeTrackerName={activeTrackerProfile?.name}
        isDark={isDark}
        onToggleTheme={() => handleThemeChange(isDark ? 'light' : 'dark')}
        userAccount={userAccount}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onMonthChange={setActiveMonth}
        onYearChange={setActiveYear}
        onOpenReportModal={() => handleTabChange('settings')}
        onOpenReports={() => handleTabChange('settings')}
        onOpenSettings={() => handleTabChange('settings')}
        onOpenCategories={() => setIsCategoriesSidebarOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
      />


      {/* Main View Container */}
      <main className="max-w-4xl mx-auto px-4 pt-4 sm:pt-6 space-y-5">
        {activeTab === 'dashboard' ? (
          <>
            {/* Screen 1: Hero Net Balance Card */}
            <HeroBalanceCard
              currentBalance={currentNetBalance}
              totalHeldMoney={totalHeldMoney}
              activeMonth={activeMonth}
              activeYear={activeYear}
              availableYears={availableYears}
              carriedFromPrevMonth={carriedFromPrevMonth}
              totalAssets={totalAssetsMonth}
              totalExpenses={monthlySpend}
              currencyCode={currencyCode}
              isDark={isDark}
              onMonthChange={setActiveMonth}
              onYearChange={setActiveYear}
              onOpenAddFunds={() => setIsAddFundsOpen(true)}
              onOpenLogExpense={() => {
                setEditingExpenseItem(null);
                setPrefilledExpenseDate(null);
                setIsLogExpenseOpen(true);
              }}
              onDownloadReport={() => handleGenerateReportPDF('monthly')}
              onNavToHeldMoney={() => handleTabChange('held')}
            />

            {/* Metric Cards (Today's, Monthly & YTD) */}
            <MetricCards
              todaySpend={todaySpend}
              monthlySpend={monthlySpend}
              ytdSpend={ytdSpend}
              monthlySavings={monthlySavings}
              totalHeldMoney={totalHeldMoney}
              activeMonth={activeMonth}
              activeYear={activeYear}
              currencyCode={currencyCode}
              isDark={isDark}
              onNavToHeldMoney={() => handleTabChange('held')}
            />

            {/* Donut Chart: Category Breakdown */}
            <DonutChart
              breakdown={categoryBreakdown}
              activeMonth={activeMonth}
              activeYear={activeYear}
              currencyCode={currencyCode}
              isDark={isDark}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Bar Chart: Monthly Burn Rate Comparison */}
            <BarChart
              monthlyChain={monthlyChain}
              activeMonth={activeMonth}
              activeYear={activeYear}
              currencyCode={currencyCode}
              isDark={isDark}
              onSelectMonth={setActiveMonth}
              resetTrigger={dashboardFocusTrigger}
              onShowActive={() => {
                const now = new Date();
                const curMonth = MONTH_NAMES[now.getMonth()];
                const curYear = now.getFullYear();
                setActiveMonth(curMonth);
                setActiveYear(curYear);
              }}
            />

            {/* Recent Ledger Transactions */}
            <RecentTransactionsList
              expenses={expenses}
              assets={assets}
              activeMonth={activeMonth}
              activeYear={activeYear}
              currencyCode={currencyCode}
              isDark={isDark}
              selectedCategory={selectedCategory}
              onDeleteExpense={handleDeleteExpense}
              onDeleteAsset={handleDeleteAsset}
              onEditExpense={(item) => {
                setEditingExpenseItem(item);
                setIsLogExpenseOpen(true);
              }}
              onOpenAddFunds={() => setIsAddFundsOpen(true)}
              onOpenLogExpense={() => {
                setEditingExpenseItem(null);
                setPrefilledExpenseDate(null);
                setIsLogExpenseOpen(true);
              }}
            />
          </>
        ) : activeTab === 'goals' ? (
          /* Screen 2: Savings Goals View */
          <GoalsView
            goals={goals}
            currencyCode={currencyCode}
            isDark={isDark}
            onSaveGoal={handleSaveGoal}
            onDeleteGoal={handleDeleteGoal}
            onSaveExpense={handleSaveExpense}
          />
        ) : activeTab === 'debts' ? (
          /* Screen 3: Debts & Installments View */
          <DebtsView
            debts={debts}
            currencyCode={currencyCode}
            isDark={isDark}
            onSaveDebt={handleSaveDebt}
            onDeleteDebt={handleDeleteDebt}
            onSaveExpense={handleSaveExpense}
          />
        ) : activeTab === 'held' ? (
          /* Screen 4: Money Held for Others View */
          <MoneyHeldView
            heldItems={heldItems}
            currencyCode={currencyCode}
            isDark={isDark}
            ownedBalance={currentNetBalance - totalHeldMoney}
            onSaveHeldItem={handleSaveHeldItem}
            onToggleReturned={handleToggleReturnedHeldItem}
            onDeleteHeldItem={handleDeleteHeldItem}
          />
        ) : activeTab === 'calendar' ? (
          /* Screen 4: Interactive Calendar View */
          <InteractiveCalendar
            expenses={expenses}
            assets={assets}
            activeMonth={activeMonth}
            activeYear={activeYear}
            availableYears={availableYears}
            currencyCode={currencyCode}
            isDark={isDark}
            onMonthChange={setActiveMonth}
            onYearChange={setActiveYear}
            monthlyChain={monthlyChain}
            onSelectDay={(dateStr) => setSelectedDayDate(dateStr)}
          />
        ) : (
          /* Screen 4: Settings & Reports View */
          <SettingsView
            userAccount={userAccount}
            onUpdateUserAccount={handleAccountChange}
            onAccountChange={handleAccountChange}
            onDeleteAccount={handleDeleteAccount}
            currentTheme={themeMode}
            themeMode={themeMode}
            onToggleTheme={handleThemeChange}
            onThemeChange={handleThemeChange}
            currencyCode={currencyCode}
            onChangeCurrency={handleCurrencyChange}
            onCurrencyChange={handleCurrencyChange}
            paymentMethods={paymentMethods}
            defaultPaymentMethodId={defaultPaymentMethodId}
            onSavePaymentMethod={handleSavePaymentMethod}
            onDeletePaymentMethod={handleDeletePaymentMethod}
            onSetDefaultPaymentMethod={handleSetDefaultPaymentMethod}
            expenses={expenses}
            assets={assets}
            expensesCount={expenses.length}
            assetsCount={assets.length}
            activeMonth={activeMonth}
            activeYear={activeYear}
            availableYears={availableYears}
            onSelectYear={setActiveYear}
            onAddNewYear={(yr) => setActiveYear(yr)}
            onClearData={handleClearData}
            onGenerateReportPDF={handleGenerateReportPDF}
            onGenerateReportCSV={handleGenerateReportCSV}
            onOpenTutorial={() => setIsTutorialOpen(true)}
          />
        )}
      </main>

      {/* First Time & Reusable How-To Tutorial Modal */}
      <TutorialModal
        isOpen={isTutorialOpen}
        isDark={isDark}
        onClose={() => {
          localStorage.setItem('has_seen_app_tutorial_v1', 'true');
          setIsTutorialOpen(false);
        }}
      />

      {/* Day Details Modal Drawer */}
      <DayDetailsDrawer
        selectedDate={selectedDayDate}
        expenses={expenses}
        currencyCode={currencyCode}
        isDark={isDark}
        onClose={() => setSelectedDayDate(null)}
        onOpenLogExpenseForDate={(dateStr) => {
          setEditingExpenseItem(null);
          setPrefilledExpenseDate(dateStr);
          setIsLogExpenseOpen(true);
        }}
        onDeleteExpense={handleDeleteExpense}
        onEditExpense={(item) => {
          setEditingExpenseItem(item);
          setIsLogExpenseOpen(true);
        }}
      />

      {/* Log Expense Bottom Sheet Modal */}
      <LogExpenseSheet
        isOpen={isLogExpenseOpen}
        currencyCode={currencyCode}
        isDark={isDark}
        goals={goals}
        debts={debts}
        helds={heldItems}
        paymentMethods={paymentMethods}
        defaultPaymentMethodId={defaultPaymentMethodId}
        onOpenManagePaymentMethods={() => setIsManageMethodsOpen(true)}
        onClose={() => {
          setIsLogExpenseOpen(false);
          setEditingExpenseItem(null);
          setPrefilledExpenseDate(null);
        }}
        onSaveExpense={handleSaveExpense}
        prefilledDate={prefilledExpenseDate}
        editingItem={editingExpenseItem}
      />

      {/* Add Asset Bottom Sheet Modal */}
      <AddAssetSheet
        isOpen={isAddFundsOpen}
        currencyCode={currencyCode}
        isDark={isDark}
        paymentMethods={paymentMethods}
        defaultPaymentMethodId={defaultPaymentMethodId}
        onOpenManagePaymentMethods={() => setIsManageMethodsOpen(true)}
        onClose={() => setIsAddFundsOpen(false)}
        onSaveAsset={handleSaveAsset}
      />

      {/* Manage Payment Methods Modal (Callable from sheets or settings) */}
      <ManagePaymentMethodsModal
        isOpen={isManageMethodsOpen}
        onClose={() => setIsManageMethodsOpen(false)}
        methods={paymentMethods}
        defaultMethodId={defaultPaymentMethodId}
        onSaveMethod={handleSavePaymentMethod}
        onDeleteMethod={handleDeletePaymentMethod}
        onSetDefaultMethod={handleSetDefaultPaymentMethod}
        isDark={isDark}
      />

      {/* Categories & Trackers Slide-Over Sidebar */}
      <CategoriesSidebar
        isOpen={isCategoriesSidebarOpen}
        isDark={isDark}
        expenses={expenses}
        currencyCode={currencyCode}
        trackers={trackers}
        activeTrackerId={activeTrackerId}
        onSelectTracker={handleSelectTracker}
        onSaveTracker={handleSaveTracker}
        onDeleteTracker={handleDeleteTracker}
        onDeleteExpense={handleDeleteExpense}
        onClose={() => setIsCategoriesSidebarOpen(false)}
        onCategoriesUpdated={() => {
          setToastMessage('✓ Categories list updated');
        }}
      />

      {/* Floating Action Button (FAB) Cluster */}
      {activeTab !== 'settings' && (
        <FabCluster
          isDark={isDark}
          onOpenLogExpense={() => {
            setEditingExpenseItem(null);
            setPrefilledExpenseDate(null);
            setIsLogExpenseOpen(true);
          }}
          onOpenAddFunds={() => setIsAddFundsOpen(true)}
        />
      )}

      {/* Persistent Bottom Tab Bar */}
      <BottomNavBar activeTab={activeTab} isDark={isDark} onTabChange={handleTabChange} />
    </div>
  );
}

