'use client';

/**
 * Input numerico con formattazione italiana live mentre l'utente digita.
 *
 * - separatore migliaia: "."
 * - separatore decimali: ","
 * - opzionale prefix "€ "
 * - caret preservation: traccia il digit-count prima del cursore, riformatta
 *   il display, e ripristina il cursore alla stessa posizione "digitale".
 *
 * onValueChange emette il valore normalizzato in formato decimale punto
 * (es. "1234.56") — pronto per essere inviato al backend / salvato in DB.
 */
import { forwardRef, useEffect, useRef, useState } from 'react';

import { Input } from './input';

interface ItalianAmountInputProps
  extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> {
  /** Valore numerico (number, decimal string, o null/undefined). */
  value: string | number | null | undefined;
  /** Emette il valore normalizzato a stringa decimale (es. "1234.56") o "" se vuoto. */
  onValueChange: (raw: string) => void;
  /** Numero massimo di decimali (default 2). */
  fractionDigits?: number;
  /** Decimali sempre mostrati quando il campo non è in focus, come in un listino (default 0). */
  minFractionDigits?: number;
}

function formatLiveDisplay(input: string, fractionDigits: number): string {
  // Mantieni solo digit, virgola, punto, minus.
  let s = input.replace(/[^0-9.,\-]/g, '');

  const negative = s.startsWith('-');
  if (negative) s = s.slice(1);

  // Prima virgola = separatore decimale; punti = separatori migliaia.
  const commaIdx = s.indexOf(',');
  let intPart: string;
  let fracPart: string | null = null;

  if (commaIdx >= 0) {
    intPart = s.slice(0, commaIdx).replace(/\./g, '');
    fracPart = s
      .slice(commaIdx + 1)
      .replace(/[^\d]/g, '')
      .slice(0, fractionDigits);
  } else {
    intPart = s.replace(/\./g, '');
  }

  // Strip leading zeros tranne uno se non c'è parte intera.
  intPart = intPart.replace(/^0+(?=\d)/, '');
  if (intPart === '' && fracPart !== null) intPart = '0';

  // Inserisci separatori migliaia.
  const formattedInt = intPart.length > 3 ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : intPart;

  let result = formattedInt;
  if (fracPart !== null) result += ',' + fracPart;
  if (negative) result = '-' + result;
  return result;
}

function toDecimalString(display: string): string {
  // Converte display italiano in decimale punto per il backend.
  // "1.234,56" → "1234.56", "" → "", "1.234" → "1234"
  const cleaned = display.replace(/[^0-9.,\-]/g, '');
  if (!cleaned) return '';
  const negative = cleaned.startsWith('-');
  const body = negative ? cleaned.slice(1) : cleaned;
  const commaIdx = body.indexOf(',');
  let intPart: string;
  let fracPart = '';
  if (commaIdx >= 0) {
    intPart = body.slice(0, commaIdx).replace(/\./g, '');
    fracPart = body.slice(commaIdx + 1).replace(/[^\d]/g, '');
  } else {
    intPart = body.replace(/\./g, '');
  }
  if (!intPart && !fracPart) return '';
  const num = `${intPart || '0'}${fracPart ? '.' + fracPart : ''}`;
  return negative ? '-' + num : num;
}

function digitCountBeforeCaret(s: string, caret: number): number {
  let count = 0;
  for (let i = 0; i < caret && i < s.length; i++) {
    if (/\d/.test(s[i])) count++;
  }
  return count;
}

function caretAtDigitN(s: string, n: number): number {
  if (n <= 0) return 0;
  let count = 0;
  for (let i = 0; i < s.length; i++) {
    if (/\d/.test(s[i])) {
      count++;
      if (count >= n) return i + 1;
    }
  }
  return s.length;
}

function formatFromExternal(
  value: string | number | null | undefined,
  minFractionDigits = 0
): string {
  if (value === null || value === undefined || value === '') return '';
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  if (!Number.isFinite(n)) return '';
  if (n === 0) return '';
  return new Intl.NumberFormat('it-IT', {
    useGrouping: 'always',
    minimumFractionDigits: minFractionDigits,
    maximumFractionDigits: Math.max(2, minFractionDigits),
  }).format(n);
}

export const ItalianAmountInput = forwardRef<HTMLInputElement, ItalianAmountInputProps>(
  function ItalianAmountInput(
    { value, onValueChange, fractionDigits = 2, minFractionDigits, inputMode = 'decimal', ...rest },
    ref
  ) {
    const innerRef = useRef<HTMLInputElement | null>(null);
    const [display, setDisplay] = useState<string>(() =>
      formatFromExternal(value, minFractionDigits)
    );

    // Sync esterno → display quando l'input non è in focus (evita interferenze
    // mentre l'utente digita).
    useEffect(() => {
      const el = innerRef.current;
      if (el && document.activeElement === el) return;
      setDisplay(formatFromExternal(value, minFractionDigits));
    }, [value, minFractionDigits]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const caretBefore = e.target.selectionStart ?? raw.length;
      const digitsBeforeCaret = digitCountBeforeCaret(raw, caretBefore);

      const newDisplay = formatLiveDisplay(raw, fractionDigits);
      setDisplay(newDisplay);
      onValueChange(toDecimalString(newDisplay));

      // Ripristina il caret alla stessa posizione "digitale".
      requestAnimationFrame(() => {
        const el = innerRef.current;
        if (!el) return;
        const newCaret = caretAtDigitN(newDisplay, digitsBeforeCaret);
        try {
          el.setSelectionRange(newCaret, newCaret);
        } catch {
          // alcuni browser/input types bloccano setSelectionRange — ignora.
        }
      });
    };

    return (
      <Input
        {...rest}
        ref={(node) => {
          innerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }}
        inputMode={inputMode}
        value={display}
        onChange={handleChange}
      />
    );
  }
);
