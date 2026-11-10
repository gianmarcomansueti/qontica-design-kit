'use client';

import { Fragment } from 'react';

import Link from 'next/link';

import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function PageTitle({
  children,
  actions,
}: {
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">{children}</h1>
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    </div>
  );
}
export function Status({ children }: { children: string }) {
  const success = [
    'Completo',
    'Chiusa',
    'Attivo',
    'Letta',
    'Risposta ricevuta',
    'Fatturata',
    'Inviata',
    'Pagato',
    'Collegata',
    'Pagata',
    'Firmato',
    'Archiviato',
  ].includes(children);
  const danger = [
    'In ritardo',
    'Da chiarire',
    'Da attenzionare',
    'Da verificare',
    'Scaduta',
    'Da aggiornare',
    'Solleciti esauriti',
    'Da ricollegare',
    'Mittente diverso',
    'Controllo periodico',
    'Non riuscito',
    'Contestato',
  ].includes(children);
  const pending = [
    'Richiesto',
    'In attesa del cliente',
    'Bozza',
    'Incompleta',
    'In corso',
    'In invio',
    'Ricevuto',
    'Senza email',
    'Da associare',
    'Proposta',
    'In attesa',
    'Inviato',
    'In firma',
    'Documenti in raccolta',
    'In firma dal cliente',
  ].includes(children);
  // A doubt of the document check (#86): the studio looks at it again, nothing is wrong yet.
  const warning = ['Da riguardare', 'In scadenza', 'Da rinnovare'].includes(children);
  return (
    <Badge
      variant="secondary"
      className={cn(
        'border-transparent font-medium',
        success && 'bg-primary/10 text-primary',
        danger && 'bg-destructive/10 text-destructive',
        pending && 'bg-accent text-accent-foreground',
        warning && 'bg-qontica-warning-soft text-foreground'
      )}
    >
      {children}
    </Badge>
  );
}
export function Pick({
  value,
  onChange,
  options,
  label,
  className,
  disabled,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger id={id} aria-label={label} className={cn('w-full sm:w-44', className)}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export function SearchField({
  value,
  onChange,
  placeholder = 'Cerca…',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-3 size-4" />
      <Input
        aria-label={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}
export function SectionTabs({
  base,
  current,
  tabs,
}: {
  base: string;
  current: string;
  tabs: { id: string; label: string; count?: number }[];
}) {
  return (
    <nav aria-label="Sezioni" className="mb-6 flex gap-6 overflow-x-auto border-b">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={`${base}${tab.id ? `/${tab.id}` : ''}`}
          aria-current={current === tab.id ? 'page' : undefined}
          className={cn(
            'flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium',
            current === tab.id
              ? 'border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground border-transparent'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs">
              {tab.count}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
/**
 * One choice among a few, each with a sentence to read: native radios (the project has no
 * Radix radio group), grouped by `name`, the arrows move between them as in any radio group.
 */
export function RadioChoices<T extends string>({
  name,
  legend,
  value,
  onChange,
  options,
}: {
  name: string;
  legend: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: React.ReactNode }[];
}) {
  return (
    <fieldset className="space-y-1">
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className="flex min-h-11 cursor-pointer items-start gap-3 py-1.5 text-sm leading-6"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="accent-primary mt-1.5 size-4 shrink-0"
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground py-16 text-center text-sm">{children}</p>;
}
export function AvatarName({ name, detail }: { name: string; detail?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-md text-xs font-semibold">
        {name
          .split(' ')
          .slice(0, 2)
          .map((s) => s[0])
          .join('')}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-medium">{name}</span>
        {detail && <span className="text-muted-foreground block truncate text-xs">{detail}</span>}
      </span>
    </div>
  );
}
export function StudioTable<T>({
  data,
  columns,
  total,
  page,
  pageSize,
  onPage,
  sorting,
  onSorting,
  linkedRows = false,
  renderExpanded,
  onRowClick,
}: {
  data: T[];
  columns: ColumnDef<T>[];
  total: number;
  page: number;
  pageSize: number;
  onPage: (page: number) => void;
  sorting?: SortingState;
  onSorting?: (sorting: SortingState) => void;
  linkedRows?: boolean;
  renderExpanded?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
}) {
  // TanStack exposes mutable table methods; this component deliberately opts out of compilation.
  'use no memo';
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table v8 is intentionally outside React Compiler memoization.
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    rowCount: total,
    state: { sorting: sorting ?? [] },
    onSortingChange: (next) => onSorting?.(typeof next === 'function' ? next(sorting ?? []) : next),
  });
  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="bg-muted/50 hover:bg-muted/50">
              {group.headers.map((header) => (
                <TableHead key={header.id} className="h-9 px-3 text-xs font-medium">
                  {header.column.getCanSort() && onSorting ? (
                    <button
                      className="flex items-center gap-1.5"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'desc' ? (
                        <ArrowDown className="size-3" />
                      ) : (
                        <ArrowUp
                          className={cn('size-3', !header.column.getIsSorted() && 'opacity-30')}
                        />
                      )}
                    </button>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <TableRow
                className={cn(
                  'h-9',
                  linkedRows && 'relative isolate cursor-pointer',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={
                  onRowClick
                    ? (event) => {
                        if (
                          !(event.target instanceof Element) ||
                          !event.target.closest('a,button,input,select,textarea,[role="button"]')
                        )
                          onRowClick(row.original);
                      }
                    : undefined
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-3 py-1">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
              {renderExpanded?.(row.original) && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="bg-muted/20 p-0">
                    {renderExpanded(row.original)}
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
          {!data.length && (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <Empty>Nessun risultato con questi filtri.</Empty>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <StudioPager total={total} page={page} pageSize={pageSize} onPage={onPage} />
    </div>
  );
}

/** The footer of a paged list: how many results, and the previous and next page. */
export function StudioPager({
  total,
  page,
  pageSize,
  onPage,
}: {
  total: number;
  page: number;
  pageSize: number;
  onPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="text-muted-foreground mt-5 flex items-center justify-between text-xs">
      <span>{total === 1 ? '1 risultato' : `${total} risultati`}</span>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="size-11 sm:size-9"
          aria-label="Pagina precedente"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span>
          {page} di {pages}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-11 sm:size-9"
          aria-label="Pagina successiva"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
