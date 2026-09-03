import { CategoryMeta, CategoryType } from '../types';

export const DEFAULT_CATEGORIES: Record<string, CategoryMeta> = {
  'Snacks': {
    name: 'Snacks',
    color: '#F59E0B',
    bgColor: 'bg-amber-500',
    lightBg: 'bg-amber-50 text-amber-700 border-amber-200',
    iconName: 'Cookie',
    description: 'Casual everyday treats and quick refreshments',
  },
  'Food & Groceries': {
    name: 'Food & Groceries',
    color: '#14B8A6',
    bgColor: 'bg-teal-500',
    lightBg: 'bg-teal-50 text-teal-700 border-teal-200',
    iconName: 'ShoppingBag',
    description: 'Supermarket purchases, produce, and main household meals',
  },
  'Commute & Transit': {
    name: 'Commute & Transit',
    color: '#3B82F6',
    bgColor: 'bg-blue-500',
    lightBg: 'bg-blue-50 text-blue-700 border-blue-200',
    iconName: 'Bus',
    description: 'Taxis, fuel, public transportation, and rideshares',
  },
  'Family Expenses': {
    name: 'Family Expenses',
    color: '#8B5CF6',
    bgColor: 'bg-purple-500',
    lightBg: 'bg-purple-50 text-purple-700 border-purple-200',
    iconName: 'HeartHandshake',
    description: 'Shared household contributions and family care obligations',
  },
  'Entertainment': {
    name: 'Entertainment',
    color: '#EC4899',
    bgColor: 'bg-pink-500',
    lightBg: 'bg-pink-50 text-pink-700 border-pink-200',
    iconName: 'Ticket',
    description: 'Outings, dining out, events, and leisure activities',
  },
  'Bills & Utilities': {
    name: 'Bills & Utilities',
    color: '#06B6D4',
    bgColor: 'bg-cyan-500',
    lightBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    iconName: 'Zap',
    description: 'Recurring monthly bills, internet, electricity, and subscriptions',
  },
  'Personal & Shopping': {
    name: 'Personal & Shopping',
    color: '#F43F5E',
    bgColor: 'bg-rose-500',
    lightBg: 'bg-rose-50 text-rose-700 border-rose-200',
    iconName: 'Shirt',
    description: 'Clothing, individual supplies, personal care, and retail purchases',
  },
  'Savings': {
    name: 'Savings',
    color: '#EAB308',
    bgColor: 'bg-yellow-500',
    lightBg: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    iconName: 'PiggyBank',
    description: 'Monthly fund allocations set aside for future security',
  },
};

export const SPECIAL_SYSTEM_CATEGORIES: Record<string, CategoryMeta> = {
  'Debts & Installments': {
    name: 'Debts & Installments',
    color: '#6366F1',
    bgColor: 'bg-indigo-500',
    lightBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconName: 'CreditCard',
    description: 'Loan repayments, credit card debts, and monthly installments',
  },
  'Money Held': {
    name: 'Money Held',
    color: '#8B5CF6',
    bgColor: 'bg-purple-500',
    lightBg: 'bg-purple-50 text-purple-700 border-purple-200',
    iconName: 'HandCoins',
    description: 'Return money held for others back to them',
  },
};

const CUSTOM_CATEGORIES_KEY = 'pf_custom_categories_v1';

export function getStoredCustomCategories(): Record<string, CategoryMeta> {
  try {
    const raw = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading custom categories', e);
  }
  return {};
}

export function updateCustomCategory(oldName: string, meta: CategoryMeta): Record<string, CategoryMeta> {
  const current = getStoredCustomCategories();
  const updated = { ...current };

  if (oldName && oldName !== meta.name) {
    const oldMeta = current[oldName] || DEFAULT_CATEGORIES[oldName];
    if (oldMeta) {
      updated[oldName] = { ...oldMeta, isHidden: true };
    }
  }

  updated[meta.name] = {
    ...meta,
    isHidden: false,
  };

  try {
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error updating custom category', e);
  }
  return updated;
}

export function saveCustomCategory(meta: CategoryMeta): Record<string, CategoryMeta> {
  const current = getStoredCustomCategories();
  const updated = {
    ...current,
    [meta.name]: {
      ...meta,
      isHidden: false,
    },
  };
  try {
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving custom category', e);
  }
  return updated;
}

export function deleteCategory(categoryName: string): Record<string, CategoryMeta> {
  const currentCustom = getStoredCustomCategories();
  const existingMeta = currentCustom[categoryName] || DEFAULT_CATEGORIES[categoryName];
  const updated = {
    ...currentCustom,
    [categoryName]: {
      ...(existingMeta || { name: categoryName, color: '#64748B' }),
      isHidden: true,
    },
  };
  try {
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error deleting category', e);
  }
  return getAllCategoriesMap();
}

export function getAllCategoriesMap(): Record<string, CategoryMeta> {
  const custom = getStoredCustomCategories();
  // Ensure Snacks is never permanently hidden if default
  if (custom['Snacks'] && custom['Snacks'].isHidden) {
    delete custom['Snacks'];
    try {
      localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(custom));
    } catch (e) {
      console.error('Error restoring Snacks category', e);
    }
  }
  const merged = { ...DEFAULT_CATEGORIES, ...custom };
  // Never expose Debts & Installments or Money Held as regular expense categories
  delete (merged as any)['Debts & Installments'];
  delete (merged as any)['Money Held'];

  const active: Record<string, CategoryMeta> = {};
  for (const key of Object.keys(merged)) {
    if (!(merged[key] as any)?.isHidden) {
      active[key] = merged[key];
    }
  }
  return active;
}

export function getAllCategoryList(): string[] {
  const allMap = getAllCategoriesMap();
  return Object.keys(allMap);
}

export function getCategoryMeta(categoryName: string): CategoryMeta {
  const allMap = getAllCategoriesMap();
  if (allMap[categoryName]) {
    return allMap[categoryName];
  }
  if (SPECIAL_SYSTEM_CATEGORIES[categoryName]) {
    return SPECIAL_SYSTEM_CATEGORIES[categoryName];
  }
  if (categoryName === 'Entertainment & Leisure' && allMap['Entertainment']) {
    return allMap['Entertainment'];
  }
  return {
    name: categoryName || 'Other',
    color: '#64748B',
    bgColor: 'bg-slate-500',
    lightBg: 'bg-slate-100 text-slate-700 border-slate-300',
    iconName: 'Tag',
    description: 'Custom expense category',
  };
}

export const CATEGORIES: Record<string, CategoryMeta> = new Proxy(DEFAULT_CATEGORIES, {
  get(target, prop: string) {
    const all = getAllCategoriesMap();
    if (all[prop]) return all[prop];
    if (SPECIAL_SYSTEM_CATEGORIES[prop]) return SPECIAL_SYSTEM_CATEGORIES[prop];
    return getCategoryMeta(prop);
  },
});

export const CATEGORY_LIST = getAllCategoryList();

