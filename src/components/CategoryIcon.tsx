import React from 'react';
import {
  ShoppingBag,
  Utensils,
  Bus,
  HeartHandshake,
  Ticket,
  Zap,
  Shirt,
  PiggyBank,
  CreditCard,
  Tag,
  Cookie,
  Car,
  Home,
  Heart,
  Gift,
  Smartphone,
  Coffee,
  Film,
  Briefcase,
  GraduationCap,
  Plane,
  Shield,
  Smile,
  Dumbbell,
  Music,
  BookOpen,
  Wrench,
  Sparkles,
  Laptop,
  HandCoins,
} from 'lucide-react';

export const CATEGORY_ICON_OPTIONS = [
  { name: 'Tag', icon: Tag, label: 'Tag' },
  { name: 'ShoppingBag', icon: ShoppingBag, label: 'Shopping' },
  { name: 'Utensils', icon: Utensils, label: 'Food' },
  { name: 'Cookie', icon: Cookie, label: 'Snacks' },
  { name: 'Bus', icon: Bus, label: 'Transit' },
  { name: 'Car', icon: Car, label: 'Car' },
  { name: 'Home', icon: Home, label: 'Home' },
  { name: 'HeartHandshake', icon: HeartHandshake, label: 'Family' },
  { name: 'Heart', icon: Heart, label: 'Health' },
  { name: 'Ticket', icon: Ticket, label: 'Events' },
  { name: 'Film', icon: Film, label: 'Movies' },
  { name: 'Music', icon: Music, label: 'Music' },
  { name: 'Zap', icon: Zap, label: 'Utilities' },
  { name: 'Smartphone', icon: Smartphone, label: 'Phone' },
  { name: 'Shirt', icon: Shirt, label: 'Clothes' },
  { name: 'PiggyBank', icon: PiggyBank, label: 'Savings' },
  { name: 'CreditCard', icon: CreditCard, label: 'Debts' },
  { name: 'HandCoins', icon: HandCoins, label: 'Money Held' },
  { name: 'Gift', icon: Gift, label: 'Gift' },
  { name: 'Coffee', icon: Coffee, label: 'Coffee' },
  { name: 'Briefcase', icon: Briefcase, label: 'Work' },
  { name: 'GraduationCap', icon: GraduationCap, label: 'Education' },
  { name: 'Plane', icon: Plane, label: 'Travel' },
  { name: 'Shield', icon: Shield, label: 'Insurance' },
  { name: 'Dumbbell', icon: Dumbbell, label: 'Fitness' },
  { name: 'BookOpen', icon: BookOpen, label: 'Books' },
  { name: 'Wrench', icon: Wrench, label: 'Services' },
  { name: 'Sparkles', icon: Sparkles, label: 'Special' },
  { name: 'Laptop', icon: Laptop, label: 'Tech' },
  { name: 'Smile', icon: Smile, label: 'Personal' },
];

interface CategoryIconProps {
  iconName?: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName = 'Tag',
  className = 'w-4 h-4',
}) => {
  const found = CATEGORY_ICON_OPTIONS.find((i) => i.name === iconName);
  const IconComp = found ? found.icon : Tag;
  return <IconComp className={className} />;
};
