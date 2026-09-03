import { AssetItem, DebtItem, ExpenseItem, GoalItem, HeldItem, ThemeMode, UserAccount, TrackerProfile, PaymentMethod } from '../types';
import { getMonthNameFromDate, getYearFromDate } from './formatters';
import { INITIAL_ASSETS, INITIAL_EXPENSES } from './sampleData';
import { DEFAULT_PAYMENT_METHODS } from '../constants/paymentMethods';

const EXPENSES_KEY = 'pf_expenses_log_v1';
const ASSETS_KEY = 'pf_assets_log_v1';
const GOALS_KEY = 'pf_goals_log_v1';
const DEBTS_KEY = 'pf_debts_log_v1';
const HELD_KEY = 'pf_held_money_v1';
const CURRENCY_KEY = 'pf_currency_pref_v1';
const THEME_KEY = 'pf_theme_pref_v1';
const USER_KEY = 'pf_user_account_v1';
const TRACKERS_KEY = 'pf_trackers_v1';
const ACTIVE_TRACKER_ID_KEY = 'pf_active_tracker_id_v1';
const PAYMENT_METHODS_KEY = 'pf_payment_methods_v1';
const DEFAULT_PAYMENT_METHOD_ID_KEY = 'pf_default_payment_method_id_v1';

export const DEFAULT_TRACKER: TrackerProfile = {
  id: 'default',
  name: 'Primary Tracker',
  currencyCode: 'EGP',
  createdAt: 1788500000000,
};

export function getStoredTrackers(): TrackerProfile[] {
  try {
    const raw = localStorage.getItem(TRACKERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading trackers', e);
  }
  const initialCurrency = getStoredCurrency() || 'EGP';
  const initialTrackers: TrackerProfile[] = [{ ...DEFAULT_TRACKER, currencyCode: initialCurrency }];
  try {
    localStorage.setItem(TRACKERS_KEY, JSON.stringify(initialTrackers));
  } catch (e) {
    console.error('Error saving initial trackers', e);
  }
  return initialTrackers;
}

export function getActiveTrackerId(): string {
  try {
    const activeId = localStorage.getItem(ACTIVE_TRACKER_ID_KEY);
    if (activeId) return activeId;
  } catch (e) {
    console.error('Error reading active tracker ID', e);
  }
  return 'default';
}

export function setActiveTrackerId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_TRACKER_ID_KEY, id);
  } catch (e) {
    console.error('Error saving active tracker ID', e);
  }
}

export function saveTracker(tracker: { id?: string; name: string; currencyCode: string }): { trackers: TrackerProfile[]; activeTracker: TrackerProfile } {
  const current = getStoredTrackers();
  let updatedTrackers: TrackerProfile[];
  let savedProfile: TrackerProfile;

  if (tracker.id) {
    updatedTrackers = current.map((t) => (t.id === tracker.id ? { ...t, name: tracker.name, currencyCode: tracker.currencyCode } : t));
    savedProfile = updatedTrackers.find((t) => t.id === tracker.id)!;
  } else {
    savedProfile = {
      id: `tracker-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: tracker.name,
      currencyCode: tracker.currencyCode,
      createdAt: Date.now(),
    };
    updatedTrackers = [...current, savedProfile];
  }

  localStorage.setItem(TRACKERS_KEY, JSON.stringify(updatedTrackers));
  setActiveTrackerId(savedProfile.id);
  saveCurrency(savedProfile.currencyCode);

  return { trackers: updatedTrackers, activeTracker: savedProfile };
}

export function deleteTracker(id: string): { trackers: TrackerProfile[]; nextActiveId: string } {
  const current = getStoredTrackers();
  if (current.length <= 1) {
    return { trackers: current, nextActiveId: getActiveTrackerId() };
  }
  const updated = current.filter((t) => t.id !== id);
  localStorage.setItem(TRACKERS_KEY, JSON.stringify(updated));

  if (id !== 'default') {
    try {
      localStorage.removeItem(`pf_expenses_log_${id}`);
      localStorage.removeItem(`pf_assets_log_${id}`);
      localStorage.removeItem(`pf_goals_log_${id}`);
      localStorage.removeItem(`pf_debts_log_${id}`);
      localStorage.removeItem(`pf_held_money_${id}`);
    } catch (e) {
      console.error('Error deleting tracker data keys', e);
    }
  }

  const currentActive = getActiveTrackerId();
  const nextActiveId = currentActive === id ? updated[0].id : currentActive;
  setActiveTrackerId(nextActiveId);

  const activeProfile = updated.find((t) => t.id === nextActiveId);
  if (activeProfile) {
    saveCurrency(activeProfile.currencyCode);
  }

  return { trackers: updated, nextActiveId };
}

function getTrackerKey(prefix: 'expenses' | 'assets' | 'goals' | 'debts' | 'held', trackerId?: string): string {
  const activeId = trackerId || getActiveTrackerId();
  if (activeId === 'default') {
    if (prefix === 'expenses') return EXPENSES_KEY;
    if (prefix === 'assets') return ASSETS_KEY;
    if (prefix === 'goals') return GOALS_KEY;
    if (prefix === 'debts') return DEBTS_KEY;
    if (prefix === 'held') return HELD_KEY;
  }
  return `pf_${prefix}_log_${activeId}`;
}

const INITIAL_HELD_ITEMS: HeldItem[] = [];
const INITIAL_DEBTS: DebtItem[] = [];
const INITIAL_GOALS: GoalItem[] = [];

export function getStoredCurrency(): string {
  try {
    return localStorage.getItem(CURRENCY_KEY) || 'EGP';
  } catch {
    return 'EGP';
  }
}

export function saveCurrency(currencyCode: string): void {
  try {
    localStorage.setItem(CURRENCY_KEY, currencyCode);
  } catch (e) {
    console.error('Error saving currency preference', e);
  }
}

export function getStoredTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Error saving theme', e);
  }
}

export function getStoredUserAccount(): UserAccount {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading user account', e);
  }
  return {
    name: 'Areej Ahmed',
    email: 'areejahmed.27502@gmail.com',
    isLoggedIn: true,
    joinedDate: '2026-08-01',
  };
}

export function saveUserAccount(user: UserAccount): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Error saving user account', e);
  }
}


export function getStoredExpenses(trackerId?: string): ExpenseItem[] {
  const key = getTrackerKey('expenses', trackerId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading expenses from storage', e);
    return [];
  }
}

export function saveExpenseItem(
  expense: Omit<ExpenseItem, 'transaction_id' | 'month_name' | 'year' | 'timestamp'> & { transaction_id?: string },
  trackerId?: string
): ExpenseItem {
  const key = getTrackerKey('expenses', trackerId);
  const current = getStoredExpenses(trackerId);
  const monthName = getMonthNameFromDate(expense.entry_date);
  const year = getYearFromDate(expense.entry_date);

  const newItem: ExpenseItem = {
    transaction_id: expense.transaction_id || `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    entry_date: expense.entry_date,
    category: expense.category,
    amount: Number(expense.amount),
    notes: expense.notes || '',
    paymentMethodId: expense.paymentMethodId,
    paymentMethodName: expense.paymentMethodName,
    goalId: expense.goalId,
    debtId: expense.debtId,
    heldId: expense.heldId,
    month_name: monthName,
    year: year,
    timestamp: Date.now(),
  };

  const updated = [newItem, ...current];
  localStorage.setItem(key, JSON.stringify(updated));
  return newItem;
}

export function updateExpenseItem(updatedItem: ExpenseItem, trackerId?: string): ExpenseItem[] {
  const key = getTrackerKey('expenses', trackerId);
  const current = getStoredExpenses(trackerId);
  const monthName = getMonthNameFromDate(updatedItem.entry_date);
  const year = getYearFromDate(updatedItem.entry_date);

  const updated = current.map((item) =>
    item.transaction_id === updatedItem.transaction_id
      ? {
          ...updatedItem,
          month_name: monthName,
          year: year,
          amount: Number(updatedItem.amount),
        }
      : item
  );

  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

export function deleteExpenseItem(id: string, trackerId?: string): ExpenseItem[] {
  const key = getTrackerKey('expenses', trackerId);
  const current = getStoredExpenses(trackerId);
  const updated = current.filter((item) => item.transaction_id !== id);
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

export function getStoredAssets(trackerId?: string): AssetItem[] {
  const key = getTrackerKey('assets', trackerId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading assets from storage', e);
    return [];
  }
}

export function saveAssetItem(
  asset: Omit<AssetItem, 'asset_id' | 'month_name' | 'year' | 'timestamp'> & { asset_id?: string },
  trackerId?: string
): AssetItem {
  const key = getTrackerKey('assets', trackerId);
  const current = getStoredAssets(trackerId);
  const monthName = getMonthNameFromDate(asset.date_added);
  const year = getYearFromDate(asset.date_added);

  const newItem: AssetItem = {
    asset_id: asset.asset_id || `asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    date_added: asset.date_added,
    source_label: asset.source_label,
    amount: Number(asset.amount),
    notes: asset.notes || '',
    paymentMethodId: asset.paymentMethodId,
    paymentMethodName: asset.paymentMethodName,
    month_name: monthName,
    year: year,
    timestamp: Date.now(),
  };

  const updated = [newItem, ...current];
  localStorage.setItem(key, JSON.stringify(updated));
  return newItem;
}

export function deleteAssetItem(id: string, trackerId?: string): AssetItem[] {
  const key = getTrackerKey('assets', trackerId);
  const current = getStoredAssets(trackerId);
  const updated = current.filter((item) => item.asset_id !== id);
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

export function clearAllData(trackerId?: string): { expenses: ExpenseItem[]; assets: AssetItem[] } {
  const expKey = getTrackerKey('expenses', trackerId);
  const assetKey = getTrackerKey('assets', trackerId);
  const goalKey = getTrackerKey('goals', trackerId);
  const debtKey = getTrackerKey('debts', trackerId);
  const heldKey = getTrackerKey('held', trackerId);

  localStorage.setItem(expKey, JSON.stringify([]));
  localStorage.setItem(assetKey, JSON.stringify([]));
  localStorage.setItem(goalKey, JSON.stringify([]));
  localStorage.setItem(debtKey, JSON.stringify([]));
  localStorage.setItem(heldKey, JSON.stringify([]));

  return { expenses: [], assets: [] };
}

// Goals Storage Functions
export function getStoredGoals(trackerId?: string): GoalItem[] {
  const key = getTrackerKey('goals', trackerId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading goals from storage', e);
    return [];
  }
}

export function saveGoalItem(goal: Omit<GoalItem, 'id' | 'createdAt'> & { id?: string }, trackerId?: string): GoalItem[] {
  const key = getTrackerKey('goals', trackerId);
  const current = getStoredGoals(trackerId);
  if (goal.id) {
    const updated = current.map((g) => (g.id === goal.id ? { ...g, ...goal } : g));
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } else {
    const newGoal: GoalItem = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };
    const updated = [newGoal, ...current];
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  }
}

export function updateGoalItem(goal: GoalItem, trackerId?: string): GoalItem[] {
  const key = getTrackerKey('goals', trackerId);
  const current = getStoredGoals(trackerId);
  const updated = current.map((g) => (g.id === goal.id ? goal : g));
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

export function deleteGoalItem(id: string, trackerId?: string): GoalItem[] {
  const key = getTrackerKey('goals', trackerId);
  const current = getStoredGoals(trackerId);
  const updated = current.filter((g) => g.id !== id);
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

// Debts Storage Functions
export function getStoredDebts(trackerId?: string): DebtItem[] {
  const key = getTrackerKey('debts', trackerId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading debts from storage', e);
    return [];
  }
}

export function saveDebtItem(debt: Omit<DebtItem, 'id' | 'createdAt'> & { id?: string }, trackerId?: string): DebtItem[] {
  const key = getTrackerKey('debts', trackerId);
  const current = getStoredDebts(trackerId);
  if (debt.id) {
    const updated = current.map((d) => (d.id === debt.id ? { ...d, ...debt } : d));
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } else {
    const newDebt: DebtItem = {
      ...debt,
      id: `debt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };
    const updated = [newDebt, ...current];
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  }
}

export function updateDebtItem(debt: DebtItem, trackerId?: string): DebtItem[] {
  const key = getTrackerKey('debts', trackerId);
  const current = getStoredDebts(trackerId);
  const updated = current.map((d) => (d.id === debt.id ? debt : d));
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

export function deleteDebtItem(id: string, trackerId?: string): DebtItem[] {
  const key = getTrackerKey('debts', trackerId);
  const current = getStoredDebts(trackerId);
  const updated = current.filter((d) => d.id !== id);
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

// Money Held Storage Functions
export function getStoredHeldItems(trackerId?: string): HeldItem[] {
  const key = getTrackerKey('held', trackerId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading held items from storage', e);
    return [];
  }
}

export function saveHeldItem(held: Omit<HeldItem, 'id' | 'createdAt'> & { id?: string }, trackerId?: string): HeldItem[] {
  const key = getTrackerKey('held', trackerId);
  const current = getStoredHeldItems(trackerId);
  if (held.id) {
    const updated = current.map((h) => (h.id === held.id ? { ...h, ...held } : h));
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } else {
    const newHeld: HeldItem = {
      ...held,
      id: `held-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };
    const updated = [newHeld, ...current];
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  }
}

export function toggleHeldItemReturned(id: string, returnedDateStr: string, trackerId?: string): HeldItem[] {
  const key = getTrackerKey('held', trackerId);
  const current = getStoredHeldItems(trackerId);
  const updated = current.map((h) => {
    if (h.id === id) {
      const nextReturned = !h.isReturned;
      return {
        ...h,
        isReturned: nextReturned,
        returnedDate: nextReturned ? returnedDateStr : undefined,
      };
    }
    return h;
  });
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

export function deleteHeldItem(id: string, trackerId?: string): HeldItem[] {
  const key = getTrackerKey('held', trackerId);
  const current = getStoredHeldItems(trackerId);
  const updated = current.filter((h) => h.id !== id);
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

// Payment Methods Storage Functions
export function getStoredPaymentMethods(): PaymentMethod[] {
  try {
    const raw = localStorage.getItem(PAYMENT_METHODS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading payment methods', e);
  }
  try {
    localStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(DEFAULT_PAYMENT_METHODS));
  } catch (e) {
    console.error('Error saving default payment methods', e);
  }
  return DEFAULT_PAYMENT_METHODS;
}

export function getDefaultPaymentMethodId(): string {
  try {
    const defaultId = localStorage.getItem(DEFAULT_PAYMENT_METHOD_ID_KEY);
    if (defaultId) return defaultId;
  } catch (e) {
    console.error('Error reading default payment method ID', e);
  }
  return 'pm-cash';
}

export function setDefaultPaymentMethodId(id: string): void {
  try {
    localStorage.setItem(DEFAULT_PAYMENT_METHOD_ID_KEY, id);
    const methods = getStoredPaymentMethods();
    const updated = methods.map((m) => ({
      ...m,
      isDefault: m.id === id,
    }));
    localStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error setting default payment method ID', e);
  }
}

export function savePaymentMethod(method: Omit<PaymentMethod, 'id' | 'createdAt'> & { id?: string }): PaymentMethod[] {
  const current = getStoredPaymentMethods();
  let updated: PaymentMethod[];

  if (method.id) {
    updated = current.map((m) => (m.id === method.id ? { ...m, ...method } : m));
  } else {
    const newMethod: PaymentMethod = {
      ...method,
      id: `pm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    updated = [...current, newMethod];
  }

  if (method.isDefault && method.id) {
    updated = updated.map((m) => ({
      ...m,
      isDefault: m.id === method.id,
    }));
    localStorage.setItem(DEFAULT_PAYMENT_METHOD_ID_KEY, method.id);
  }

  localStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(updated));
  return updated;
}

export function deletePaymentMethod(id: string): PaymentMethod[] {
  const current = getStoredPaymentMethods();
  if (current.length <= 1) return current; // Keep at least one payment method

  const updated = current.filter((m) => m.id !== id);
  localStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(updated));

  const currentDefault = getDefaultPaymentMethodId();
  if (currentDefault === id) {
    const nextDefault = updated[0]?.id || 'pm-cash';
    setDefaultPaymentMethodId(nextDefault);
  }

  return updated;
}

// Backup & Restore All Local Data (Phone-to-phone migration)
export function exportAllDataBackup(): string {
  const allData: Record<string, any> = {
    version: '1.0',
    timestamp: Date.now(),
    exportDate: new Date().toISOString(),
  };

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('pf_') || key.startsWith('custom_categories'))) {
        const val = localStorage.getItem(key);
        if (val) {
          try {
            allData[key] = JSON.parse(val);
          } catch {
            allData[key] = val;
          }
        }
      }
    }
  } catch (e) {
    console.error('Error creating backup export', e);
  }

  return JSON.stringify(allData, null, 2);
}

export function restoreAllDataFromBackup(backupJsonString: string): { success: boolean; message: string; itemCount?: number } {
  try {
    const data = JSON.parse(backupJsonString);
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Invalid backup file format' };
    }

    let restoredCount = 0;
    Object.keys(data).forEach((key) => {
      if (key.startsWith('pf_') || key.startsWith('custom_categories')) {
        const val = data[key];
        if (val !== undefined && val !== null) {
          localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
          restoredCount++;
        }
      }
    });

    if (restoredCount === 0) {
      return { success: false, message: 'No valid Money Tracker records found in backup.' };
    }

    return { success: true, message: `Successfully restored ${restoredCount} financial data items!`, itemCount: restoredCount };
  } catch (e: any) {
    console.error('Error importing backup data', e);
    return { success: false, message: e.message || 'Failed to parse backup JSON' };
  }
}


