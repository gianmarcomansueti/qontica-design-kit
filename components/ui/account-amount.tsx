import type { ReactNode } from 'react';

import {
  coerceAmountToNumber,
  formatItalianAccountAmount,
} from '@/lib/format/italian-statement-amount';
import { cn } from '@/lib/utils';

export type AccountAmountProps = {
  value: number | string | null | undefined;
  negativeStyle?: 'accounting' | 'minus';
  showCurrency?: boolean;
  /** When true, null / non-finite shows `fallback` instead of zero. */
  empty?: boolean;
  fallback?: ReactNode;
  className?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

/**
 * Renders DB/API numeric amounts using Italian grouping and decimal comma.
 * Use for all account / monetary read-only displays.
 */
export function AccountAmount({
  value,
  negativeStyle = 'accounting',
  showCurrency = false,
  empty = false,
  fallback = '—',
  className,
  minimumFractionDigits,
  maximumFractionDigits,
}: AccountAmountProps) {
  const n = coerceAmountToNumber(value);
  if (empty && (n === null || !Number.isFinite(n))) {
    return <span className={cn('tabular-nums', className)}>{fallback}</span>;
  }
  const text = formatItalianAccountAmount(value ?? 0, {
    negativeStyle,
    withEuro: showCurrency,
    minimumFractionDigits,
    maximumFractionDigits,
  });
  return <span className={cn('tabular-nums', className)}>{text}</span>;
}
