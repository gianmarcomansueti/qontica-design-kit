'use client';

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

import { SettingsActionsTarget } from './settings-actions';

/* ----------------------------------------------------------------------------------------------
 * Save status: the pages save by themselves, the header says where they are.
 * -------------------------------------------------------------------------------------------- */

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const SaveStatusContext = createContext<{
  state: SaveState;
  begin: () => void;
  end: (ok: boolean) => void;
} | null>(null);

export function SaveStatusProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState(0);
  const [last, setLast] = useState<'saved' | 'error' | null>(null);
  const begin = useCallback(() => setPending((count) => count + 1), []);
  const end = useCallback((ok: boolean) => {
    setPending((count) => Math.max(0, count - 1));
    setLast(ok ? 'saved' : 'error');
  }, []);
  const state: SaveState = pending > 0 ? 'saving' : (last ?? 'idle');
  const value = useMemo(() => ({ state, begin, end }), [state, begin, end]);
  return <SaveStatusContext.Provider value={value}>{children}</SaveStatusContext.Provider>;
}

function useSaveStatus() {
  const context = useContext(SaveStatusContext);
  if (!context) throw new Error('useSaveStatus needs SaveStatusProvider');
  return context;
}

/** The dot and the word in the page header: «Salvataggio…», «Tutto salvato», «Non salvato». */
export function SaveStatus() {
  const { state } = useSaveStatus();
  if (state === 'idle') return null;
  return (
    <span
      role="status"
      className={cn(
        'flex items-center gap-1.5 text-xs',
        state === 'error' ? 'text-destructive' : 'text-muted-foreground'
      )}
    >
      {state === 'saving' ? (
        <Loader2 className="size-3 animate-spin" aria-hidden />
      ) : (
        <span
          aria-hidden
          className={cn(
            'size-1.5 rounded-full',
            state === 'error' ? 'bg-destructive' : 'bg-qontica-success'
          )}
        />
      )}
      {state === 'saving' ? 'Salvataggio…' : state === 'error' ? 'Non salvato' : 'Tutto salvato'}
    </span>
  );
}

/**
 * Saves `value` by itself once it differs from what is persisted and stops changing for
 * `delay` ms. `save` runs with the latest value; the header shows the outcome. A value that
 * `validate` refuses waits, it is never sent.
 */
export function useAutosave<T>(
  value: T,
  persisted: T,
  save: (value: T) => Promise<unknown>,
  options: { delay?: number; validate?: (value: T) => boolean } = {}
) {
  const { begin, end } = useSaveStatus();
  const saveRef = useRef(save);
  saveRef.current = save;
  const validateRef = useRef(options.validate);
  validateRef.current = options.validate;
  const delay = options.delay ?? 800;
  const serialized = JSON.stringify(value);
  const persistedSerialized = JSON.stringify(persisted);
  useEffect(() => {
    if (serialized === persistedSerialized) return;
    if (validateRef.current && !validateRef.current(value)) return;
    const timer = window.setTimeout(async () => {
      begin();
      try {
        await saveRef.current(value);
        end(true);
      } catch {
        end(false);
      }
    }, delay);
    return () => window.clearTimeout(timer);
    // `value` is read through its serialization: a new object with the same content is no change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized, persistedSerialized, delay, begin, end]);
}

/**
 * A local copy of a persisted value to type into. When the persisted value changes (a refetch,
 * another save), the copy follows it; the reset happens during render, as React wants it.
 */
export function useDraft<T>(persisted: T): [T, (value: T | ((current: T) => T)) => void] {
  const key = JSON.stringify(persisted);
  const [state, setState] = useState({ key, value: persisted });
  if (state.key !== key) setState({ key, value: persisted });
  const setValue = useCallback(
    (value: T | ((current: T) => T)) =>
      setState((current) => ({
        key: current.key,
        value: typeof value === 'function' ? (value as (current: T) => T)(current.value) : value,
      })),
    []
  );
  return [state.key === key ? state.value : persisted, setValue];
}

/** For the saves that happen on a click (a switch, a select): wraps the promise in the status. */
export function useTrackedSave() {
  const { begin, end } = useSaveStatus();
  return useCallback(
    async <R,>(run: () => Promise<R>): Promise<R | undefined> => {
      begin();
      try {
        const result = await run();
        end(true);
        return result;
      } catch {
        end(false);
        return undefined;
      }
    },
    [begin, end]
  );
}

/* ----------------------------------------------------------------------------------------------
 * Page, block, row.
 * -------------------------------------------------------------------------------------------- */

/** The head of a section: where it belongs, its name, the status of the saves. */
export function SettingsPage({
  scope,
  title,
  actions,
  wide = false,
  tabbed = false,
  children,
}: {
  scope: string;
  title: string;
  actions?: ReactNode;
  /** For the pages with a table: more room than the rows need. */
  wide?: boolean;
  /** For the pages that open on their own tabs: the tabs draw the line under the header. */
  tabbed?: boolean;
  children: ReactNode;
}) {
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  return (
    <SettingsActionsTarget.Provider value={target}>
      <div className={wide ? 'max-w-6xl' : 'max-w-3xl'}>
        <header
          className={cn(
            'flex flex-wrap items-end justify-between gap-4',
            !tabbed && 'border-b pb-5'
          )}
        >
          <div className="min-w-0 space-y-1">
            <p className="text-muted-foreground text-xs">{scope}</p>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SaveStatus />
            <div ref={setTarget} className="flex flex-wrap items-center gap-2" />
            {actions}
          </div>
        </header>
        <div className={cn('space-y-10', tabbed ? 'mt-5' : 'mt-8')}>{children}</div>
      </div>
    </SettingsActionsTarget.Provider>
  );
}

/** A group of rows under a small title, in one bordered block. */
export function SettingsBlock({
  title,
  aside,
  tone = 'default',
  children,
}: {
  title: string;
  aside?: ReactNode;
  tone?: 'default' | 'danger';
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className={cn('text-sm font-semibold', tone === 'danger' && 'text-destructive')}>
          {title}
        </h2>
        {aside && <div className="text-muted-foreground text-xs">{aside}</div>}
      </div>
      <div
        className={cn(
          'bg-card divide-y rounded-lg border',
          tone === 'danger' && 'border-destructive/40'
        )}
      >
        {children}
      </div>
    </section>
  );
}

/** The label on the left, the control on the right. */
export function SettingsRow({
  label,
  htmlFor,
  children,
  className,
}: {
  label: ReactNode;
  htmlFor?: string;
  children?: ReactNode;
  className?: string;
}) {
  const Label = htmlFor ? 'label' : 'p';
  return (
    <div
      className={cn(
        'flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8',
        className
      )}
    >
      <div className="min-w-0 sm:max-w-[32rem]">
        <Label htmlFor={htmlFor} className="block text-sm font-medium">
          {label}
        </Label>
      </div>
      {children !== undefined && (
        <div className="flex shrink-0 items-center gap-3 sm:justify-end">{children}</div>
      )}
    </div>
  );
}

/** A switch with its state said next to it. */
export function OnOff({ on }: { on: boolean }) {
  return <span className="text-muted-foreground text-xs">{on ? 'Attivo' : 'Spento'}</span>;
}
