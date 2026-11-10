'use client';

import * as React from 'react';

import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

export type SegmentedToggleOption = { key: string; label: string; dataOnboarding?: string };

export function SegmentedToggle({
  options,
  value,
  onChange,
  className,
  fullWidth = false,
  pendingKey = null,
}: {
  options: SegmentedToggleOption[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
  /** Stretch segments to fill the container width (equal-width buttons). */
  fullWidth?: boolean;
  /**
   * L'opzione chiesta che non ha ancora i suoi dati: prende un indicatore di attesa,
   * mentre la pastiglia resta su `value`.
   *
   * Serve dove selezionare non e' istantaneo. Senza, l'unico modo di dire «sto
   * caricando» sarebbe spostare subito la selezione — e allora la pagina mostrerebbe
   * una scelta che i dati non sostengono ancora.
   */
  pendingKey?: string | null;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [pill, setPill] = React.useState({ left: 0, width: 0 });

  const measure = React.useCallback(() => {
    if (!containerRef.current) return;
    const idx = options.findIndex((o) => o.key === value);
    if (idx < 0) return;
    const buttons = containerRef.current.querySelectorAll('[data-seg-btn]');
    const btn = buttons[idx];
    if (!btn) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const btnRect = (btn as HTMLElement).getBoundingClientRect();
    setPill({
      left: btnRect.left - containerRect.left,
      width: btnRect.width,
    });
  }, [options, value]);

  React.useEffect(() => {
    measure();
  }, [measure]);

  React.useEffect(() => {
    const ro = new ResizeObserver(measure);
    const el = containerRef.current;
    if (el) ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex items-center rounded-lg border border-gray-300 p-0.5 dark:border-gray-600',
        fullWidth && 'w-full',
        className
      )}
    >
      <div
        className="bg-action absolute top-0.5 bottom-0.5 rounded-md shadow-sm transition-all duration-200 ease-out"
        style={{ left: pill.left, width: pill.width }}
      />
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          data-onboarding={opt.dataOnboarding}
          aria-pressed={value === opt.key}
          data-seg-btn
          onClick={() => onChange(opt.key)}
          aria-busy={pendingKey === opt.key}
          className={cn(
            'relative z-1 flex cursor-pointer items-center justify-center gap-1.5 rounded-[6px] px-3 py-1.5 text-xs font-medium transition-colors duration-200',
            fullWidth && 'flex-1 text-center',
            value === opt.key
              ? 'text-white'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          )}
        >
          {pendingKey === opt.key && <Loader2 className="size-3 shrink-0 animate-spin" />}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
