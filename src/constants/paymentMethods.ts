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

export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm-cash',
    name: 'Cash',
    type: 'cash',
    color: '#10B981', // emerald
    iconName: 'Banknote',
    isDefault: true,
    createdAt: 1700000000000,
  },
  {
    id: 'pm-credit',
    name: 'Credit Card',
    type: 'credit_card',
    color: '#6366F1', // indigo
    iconName: 'CreditCard',
    isDefault: false,
    createdAt: 1700000001000,
  },
  {
    id: 'pm-savings-card',
    name: 'Savings Card / Debit',
    type: 'savings_card',
    color: '#3B82F6', // blue
    iconName: 'CreditCard',
    isDefault: false,
    createdAt: 1700000002000,
  },
  {
    id: 'pm-wallet',
    name: 'Payment Wallet',
    type: 'wallet',
    color: '#8B5CF6', // purple
    iconName: 'Smartphone',
    isDefault: false,
    createdAt: 1700000003000,
  },
];
