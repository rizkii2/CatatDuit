'use client';

import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  HeartPulse,
  MoreHorizontal,
  Wallet,
  Gift,
  PlusCircle,
  Tag,
  Building,
  CreditCard,
  Coffee,
  Smartphone,
  Home,
  GraduationCap,
  Briefcase,
  Plane,
  Tv,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  LucideProps,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  HeartPulse,
  MoreHorizontal,
  Wallet,
  Gift,
  PlusCircle,
  Tag,
  Building,
  CreditCard,
  Coffee,
  Smartphone,
  Home,
  GraduationCap,
  Briefcase,
  Plane,
  Tv,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
};

interface CategoryIconProps extends LucideProps {
  name: string;
}

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
  const IconComponent = iconMap[name] || Tag;
  return <IconComponent {...props} />;
}

export const AVAILABLE_ICONS = Object.keys(iconMap);

