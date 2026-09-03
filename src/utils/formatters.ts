import { CurrencyConfig } from '../types';

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'EGP', symbol: 'EGP', name: 'Egyptian Pound (EGP)' },
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal (SAR)' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar (C$)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
];

export function formatCurrency(
  amount: number,
  currencyCode: string = 'EGP'
): string {
  const curr = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

  // Position symbol or code based on standard conventions
  if (curr.symbol === '$' || curr.symbol === '€' || curr.symbol === '£' || curr.symbol === 'C$' || curr.symbol === '¥') {
    return `${curr.symbol}${formatted}`;
  }
  return `${formatted} ${curr.symbol}`;
}

export function formatEGP(amount: number, currencyCode: string = 'EGP'): string {
  return formatCurrency(amount, currencyCode);
}

export function formatCompactCurrency(
  amount: number,
  currencyCode: string = 'EGP'
): string {
  const curr = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];
  let valStr = '';
  if (Math.abs(amount) >= 1000000) {
    valStr = `${(amount / 1000000).toFixed(1)}M`;
  } else if (Math.abs(amount) >= 1000) {
    valStr = `${(amount / 1000).toFixed(1)}K`;
  } else {
    valStr = amount.toFixed(0);
  }

  if (curr.symbol === '$' || curr.symbol === '€' || curr.symbol === '£' || curr.symbol === 'C$' || curr.symbol === '¥') {
    return `${curr.symbol}${valStr}`;
  }
  return `${valStr} ${curr.symbol}`;
}

export function formatCompactEGP(amount: number, currencyCode: string = 'EGP'): string {
  return formatCompactCurrency(amount, currencyCode);
}


export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function getMonthNameFromDate(dateStr: string): string {
  if (!dateStr) return 'August';
  const parts = dateStr.split('-');
  if (parts.length >= 2) {
    const monthIdx = parseInt(parts[1], 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return MONTH_NAMES[monthIdx];
    }
  }
  return 'August';
}

export function getYearFromDate(dateStr: string): number {
  if (!dateStr) return 2026;
  const parts = dateStr.split('-');
  if (parts.length >= 1) {
    const yr = parseInt(parts[0], 10);
    if (!isNaN(yr)) return yr;
  }
  return 2026;
}

export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  const monthIdx = parseInt(m, 10) - 1;
  const monthShort = MONTH_NAMES[monthIdx]?.substring(0, 3) || m;
  return `${monthShort} ${parseInt(d, 10)}, ${y}`;
}

export function getTodayDateString(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
