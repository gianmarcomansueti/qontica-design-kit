'use client';

import type { SortingState } from '@tanstack/react-table';

import { StudioTable } from '../../components/ui';
import { type StudioClientRow, studioClientColumns } from './clients-columns';

/** Controlled: the page fetches the rows and owns paging, sorting and the row actions. */
export function ClientsDataTable({
  clients,
  total,
  page,
  pageSize,
  onPage,
  sorting,
  onSorting,
  ...columns
}: Parameters<typeof studioClientColumns>[0] & {
  clients: StudioClientRow[];
  total: number;
  page: number;
  pageSize: number;
  onPage: (page: number) => void;
  sorting: SortingState;
  onSorting: (sorting: SortingState) => void;
}) {
  return (
    <div className="[&_thead]:bg-background [&_tbody_tr]:hover:bg-primary/20 [&_tbody_tr]:focus-within:bg-primary/20 [&_td]:border-border/50 [&_th]:border-border/50 flex min-h-0 flex-1 flex-col [&_[data-slot=table-container]]:min-h-0 [&_[data-slot=table-container]]:flex-1 [&_[data-slot=table-container]]:overflow-auto [&_td]:border-r [&_td:first-child]:border-r-0 [&_td:last-child]:border-r-0 [&_th]:border-r [&_th]:whitespace-nowrap [&_th:first-child]:border-r-0 [&_th:last-child]:border-r-0 [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-20 [&>div]:flex [&>div]:min-h-0 [&>div]:flex-1 [&>div]:flex-col [&>div>div:last-child]:mt-2 [&>div>div:last-child]:shrink-0">
      <StudioTable
        data={clients}
        columns={studioClientColumns(columns)}
        total={total}
        page={page}
        pageSize={pageSize}
        onPage={onPage}
        sorting={sorting}
        onSorting={onSorting}
        linkedRows
      />
    </div>
  );
}
