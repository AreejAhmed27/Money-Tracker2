import React from 'react';
import {
  Banknote,
  CreditCard,
  Smartphone,
  Landmark,
  Wallet,
  Receipt,
  CircleDollarSign,
  PiggyBank,
} from 'lucide-react';
import { PaymentMethodType } from '../types';

interface PaymentMethodIconProps {
  type?: PaymentMethodType;
  iconName?: string;
  className?: string;
}

export const PAYMENT_METHOD_ICONS: { name: string; label: string }[] = [
  { name: 'Banknote', label: 'Banknote (Cash)' },
  { name: 'CreditCard', label: 'Credit / Debit Card' },
  { name: 'Smartphone', label: 'Mobile Wallet / Digital' },
  { name: 'Landmark', label: 'Bank Account / Transfer' },
  { name: 'Wallet', label: 'Pocket Wallet' },
  { name: 'PiggyBank', label: 'Savings Deposit' },
  { name: 'CircleDollarSign', label: 'Currency Token' },
  { name: 'Receipt', label: 'Bill / Voucher' },
];

export const PaymentMethodIcon: React.FC<PaymentMethodIconProps> = ({
  type,
  iconName,
  className = 'w-4 h-4',
}) => {
  // If iconName is specifically provided, match it
  if (iconName === 'Banknote') return <Banknote className={className} />;
  if (iconName === 'CreditCard') return <CreditCard className={className} />;
  if (iconName === 'Smartphone') return <Smartphone className={className} />;
  if (iconName === 'Landmark') return <Landmark className={className} />;
  if (iconName === 'Wallet') return <Wallet className={className} />;
  if (iconName === 'PiggyBank') return <PiggyBank className={className} />;
  if (iconName === 'CircleDollarSign') return <CircleDollarSign className={className} />;
  if (iconName === 'Receipt') return <Receipt className={className} />;

  // Otherwise infer from type
  switch (type) {
    case 'cash':
      return <Banknote className={className} />;
    case 'credit_card':
    case 'savings_card':
      return <CreditCard className={className} />;
    case 'wallet':
      return <Smartphone className={className} />;
    case 'bank_transfer':
      return <Landmark className={className} />;
    default:
      return <Wallet className={className} />;
  }
};
