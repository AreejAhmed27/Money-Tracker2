import { AssetItem, CategoryType, ExpenseItem, MonthMetrics } from '../types';
import { MONTH_NAMES } from './formatters';

/**
 * Formula 1: Current Available Balance
 * Total Assets Logged - Total Expenses Logged across all time
 */
export function calculateCurrentNetBalance(assets: AssetItem[], expenses: ExpenseItem[]): number {
  const totalAssets = assets.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  return totalAssets - totalExpenses;
}

/**
 * Formula 2: Daily Expense Total
 */
export function calculateDailyTotal(expenses: ExpenseItem[], dateStr: string): number {
  return expenses
    .filter((e) => e.entry_date === dateStr)
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
}

/**
 * Formula 3: Monthly Expense Total
 */
export function calculateMonthlyTotal(expenses: ExpenseItem[], monthName: string, year: number = 2026): number {
  return expenses
    .filter((e) => e.month_name.toLowerCase() === monthName.toLowerCase() && e.year === year)
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
}

/**
 * Year-to-Date Summary
 * Total spent across August–December 2026 (or all logged items in active year)
 */
export function calculateYTDSummary(expenses: ExpenseItem[], targetYear: number = 2026): number {
  return expenses
    .filter((e) => e.year === targetYear)
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
}

/**
 * Spending breakdown per Category for a given month and year
 */
export function calculateCategoryBreakdown(
  expenses: ExpenseItem[],
  monthName: string,
  year: number = 2026
): Record<CategoryType, number> {
  const breakdown: Record<string, number> = {
    'Snacks': 0,
    'Food & Groceries': 0,
    'Commute & Transit': 0,
    'Family Expenses': 0,
    'Entertainment & Leisure': 0,
    'Bills & Utilities': 0,
    'Personal & Shopping': 0,
    'Savings': 0,
  };

  const monthExpenses = expenses.filter(
    (e) => e.month_name.toLowerCase() === monthName.toLowerCase() && e.year === year
  );

  monthExpenses.forEach((e) => {
    if (breakdown[e.category] !== undefined) {
      breakdown[e.category] += Number(e.amount) || 0;
    }
  });

  return breakdown as Record<CategoryType, number>;
}

/**
 * Get all available years logged in assets and expenses + current year + next year
 */
export function getAvailableYears(assets: AssetItem[], expenses: ExpenseItem[]): number[] {
  const currentYr = new Date().getFullYear();
  const baseYears: number[] = [];
  for (let y = 2020; y <= 2035; y++) {
    baseYears.push(y);
  }
  const yearsSet = new Set<number>(baseYears);
  yearsSet.add(currentYr);

  assets.forEach((a) => {
    if (a.year) yearsSet.add(a.year);
  });
  expenses.forEach((e) => {
    if (e.year) yearsSet.add(e.year);
  });

  return Array.from(yearsSet).sort((a, b) => a - b);
}

/**
 * Formula 4: Automatic Balance Carry-Over across months and years
 * Starting Balance Month N = Ending Balance Month N-1
 */
export function calculateMonthlyChain(
  assets: AssetItem[],
  expenses: ExpenseItem[],
  year: number = 2026
): MonthMetrics[] {
  // Compute prior net balance accumulated before January 1st of `year`
  const priorAssets = assets
    .filter((a) => a.year < year)
    .reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  const priorExpenses = expenses
    .filter((e) => e.year < year)
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  let currentRunningBalance = priorAssets - priorExpenses;

  const result: MonthMetrics[] = [];

  for (let mIdx = 0; mIdx < MONTH_NAMES.length; mIdx++) {
    const monthName = MONTH_NAMES[mIdx];

    const monthAssets = assets
      .filter((a) => a.month_name.toLowerCase() === monthName.toLowerCase() && a.year === year)
      .reduce((sum, a) => sum + (Number(a.amount) || 0), 0);

    const monthExpensesList = expenses.filter(
      (e) => e.month_name.toLowerCase() === monthName.toLowerCase() && e.year === year
    );

    const monthExpensesTotal = monthExpensesList.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const monthSavingsTotal = monthExpensesList
      .filter((e) => e.category === 'Savings')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const startingBalance = currentRunningBalance;
    const endingBalance = startingBalance + monthAssets - monthExpensesTotal;

    result.push({
      month_name: monthName,
      year: year,
      starting_balance: startingBalance,
      total_assets: monthAssets,
      total_expenses: monthExpensesTotal,
      total_savings: monthSavingsTotal,
      ending_balance: endingBalance,
    });

    currentRunningBalance = endingBalance;
  }

  return result;
}

