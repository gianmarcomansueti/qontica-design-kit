import * as React from 'react';

import { Input } from '@/components/ui/input';

/**
 * Drop-in replacement for `<Input type="number">` that fixes the classic
 * "0 sticks to the field" problem.
 *
 * Without this wrapper, a controlled numeric Input bound to a number state
 * cannot visually go empty: pressing backspace fires `onChange` with `""`,
 * the parent coerces `Number("")` to `0`, and the input snaps back to "0"
 * before the user can type the new digit.
 *
 * `NumberInput` keeps a local "editing text" buffer while the user is
 * typing, so the field can display an empty string during edit even though
 * the parent's stored value is still `0`. On blur the buffer is cleared and
 * the displayed text reverts to the parent value (so a left-blank field
 * shows "0" again, matching the underlying state).
 *
 * It also auto-selects the existing content on focus, so a single click +
 * any keypress immediately replaces the previous value.
 *
 * The component forwards every other prop (including `onChange`, `onBlur`,
 * `onFocus`, `step`, `min`, `max`, `id`, `placeholder`, etc.) — parent
 * onChange handlers keep their existing parsing/clamping logic.
 */
type NumberInputProps = Omit<React.ComponentProps<'input'>, 'type' | 'value'> & {
  value: number | string | undefined | null;
};

function NumberInput({ value, onChange, onFocus, onBlur, ...rest }: NumberInputProps) {
  const [editingText, setEditingText] = React.useState<string | null>(null);

  const display =
    editingText !== null ? editingText : value === undefined || value === null ? '' : String(value);

  return (
    <Input
      {...rest}
      type="number"
      value={display}
      onFocus={(e) => {
        e.currentTarget.select();
        onFocus?.(e);
      }}
      onChange={(e) => {
        setEditingText(e.target.value);
        onChange?.(e);
      }}
      onBlur={(e) => {
        setEditingText(null);
        onBlur?.(e);
      }}
      onWheel={(e) => {
        // Prevent scroll/trackpad from incrementing the numeric value.
        // blur() lets the page continue scrolling; the focused state is
        // simply dropped so the browser can't route the wheel delta to
        // the input's stepper logic.
        if (document.activeElement === e.currentTarget) {
          e.currentTarget.blur();
        }
      }}
    />
  );
}

export { NumberInput };
