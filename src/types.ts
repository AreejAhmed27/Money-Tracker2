export type CategoryType = string;

export interface CategoryMeta {
  name: string;
  color: string; // Hex color
  bgColor: string; // Tailwind bg class or inline hex
  lightBg: string;
  iconName: string;
  description: string;
  isHidden?: boolean;
}

export interface ExpenseItem {
  transaction_id: string;
  entry_date: string; // YYYY-MM-DD
  category: CategoryType;
  amount: number; // in EGP
  notes?: string;
  paymentMethodId?: string; // Optional or default payment method (e.g., pm-cash, pm-credit)
  paymentMethodName?: string; // e.g. "Cash", "Credit Card"
  goalId?: string; // Optional linked Goal ID if category is Savings
  debtId?: string; // Optional linked Debt ID if category is Debts & Installments
  heldId?: string; // Optional linked Held ID if category is Money Held
  month_name: string; // August, September, etc.
  year: number; // e.g. 2026
  timestamp: number;
}

export interface AssetItem {
  asset_id: string;
  date_added: string; // YYYY-MM-DD
  source_label: string; // e.g., "Starting Cash", "Salary"
  amount: number; // in EGP
  notes?: string;
  paymentMethodId?: string; // e.g., Cash, Credit Card, Bank Transfer
  paymentMethodName?: string;
  month_name: string;
  year: number;
  timestamp: number;
}

export interface MonthMetrics {
  month_name: string;
  year: number;
  starting_balance: number;
  total_assets: number;
  total_expenses: number;
  total_savings: number;
  ending_balance: number;
}

export type TabType = 'dashboard' | 'goals' | 'debts' | 'held' | 'calendar' | 'settings';
export type FormType = 'expense' | 'asset' | 'goal' | 'debt' | 'held' | null;
export type ThemeMode = 'light' | 'dark';

export type HeldSourceType = 'received' | 'already_held';

export interface HeldItem {
  id: string;
  personName: string;
  amount: number;
  currency: string;
  date: string;
  isReturned: boolean;
  returnedDate?: string;
  createdAt: number;
  notes?: string;
  assetId?: string;
  sourceType?: HeldSourceType;
}

export interface GoalItem {
  id: string;
  name: string; // Name of thing to buy
  targetAmount: number; // Total amount needed
  savedAmount: number; // Amount saved so far
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  createdAt: number;
  notes?: string;
}

export interface DebtItem {
  id: string;
  title: string; // Debt or installment name e.g. Car Loan
  totalAmount: number; // Total amount to pay
  paidAmount: number; // Amount paid so far
  monthsCount: number; // Number of months to pay off (e.g. 12)
  startDate: string; // YYYY-MM-DD
  createdAt: number;
  notes?: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}

export interface UserAccount {
  name: string;
  email: string;
  isLoggedIn: boolean;
  avatarUrl?: string;
  joinedDate?: string;
}

export interface TrackerProfile {
  id: string;
  name: string;
  currencyCode: string;
  createdAt: number;
}

export type PaymentMethodType = 'cash' | 'credit_card' | 'savings_card' | 'wallet' | 'bank_transfer' | 'other';

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  color: string;
  iconName?: string;
  isDefault?: boolean;
  notes?: string;
  createdAt: number;
}

