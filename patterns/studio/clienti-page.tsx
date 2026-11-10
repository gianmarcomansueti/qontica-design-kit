'use client';

import { Suspense, useEffect, useState } from 'react';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import type { SortingState } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { MODULE_KEYS } from '@/lib/modules/modules';
import { trpc } from '@/lib/trpc/client';
import type { StudioClient } from '@/lib/types/studio';

import { useAuth } from '@/hooks/use-auth';
import { useCurrentOrganization } from '@/hooks/use-current-organization';
import { useOrganization } from '@/hooks/use-organization';
import { usePlanAccess } from '@/hooks/use-plan-access';
import { useTablePagination } from '@/hooks/use-table-pagination';
import { useTableSearch } from '@/hooks/use-table-search';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { Empty } from '../components/ui';
import { ClientFormDialog } from './components/client-form-dialog';
import { ClientsDataTable } from './components/clients-data-table';
import { ClientsFilters, type ClientsStatusFilter } from './components/clients-filters';
import { NewClientWizard } from './components/new-client-wizard';

const PAGE_SIZE = 15;

function ClientsSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <Skeleton className="h-8 w-full" />
      {Array.from({ length: 8 }, (_, index) => (
        <Skeleton key={index} className="h-9 w-full" />
      ))}
    </div>
  );
}

export default function StudioClientsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-0 flex-col gap-3 p-3 sm:p-4">
          <Skeleton className="h-8 w-48" />
          <ClientsSkeleton />
        </div>
      }
    >
      <StudioClients />
    </Suspense>
  );
}

function StudioClients() {
  const { slug } = useParams<{ slug: string }>();
  const query = useSearchParams();
  const router = useRouter();
  const base = `/org/${slug}/studio`;
  const { organizationId } = useCurrentOrganization();
  const { members } = useOrganization();
  const { userId } = useAuth();
  const { modules } = usePlanAccess();
  const utils = trpc.useUtils();
  const [status, setStatus] = useState<ClientsStatusFilter>('active');
  // `null` until the user picks: the owner starts on the whole studio, a member on their clients.
  const [ownerChoice, setOwner] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  // `?nuovo=1` (the quick action of the home) opens the new client wizard on arrival.
  const [creating, setCreating] = useState(() => query.get('nuovo') === '1');
  // Once open, the address loses `nuovo`: a reload or the back button do not open it again.
  const opensNew = query.get('nuovo') === '1';
  useEffect(() => {
    if (!opensNew) return;
    const rest = new URLSearchParams(query.toString());
    rest.delete('nuovo');
    router.replace(rest.size ? `${base}/clienti?${rest}` : `${base}/clienti`, { scroll: false });
  }, [opensNew, query, router, base]);
  const [editing, setEditing] = useState<StudioClient>();
  const { inputValue, searchValue, setSearchValue } = useTableSearch({ debounceMs: 300 });
  const { page, setPage, goToFirstPage } = useTablePagination({ initialPageSize: PAGE_SIZE });
  // Every filter change starts again from the first page.
  const filtered =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      set(value);
      goToFirstPage();
    };

  const access = trpc.studio.access.me.useQuery(
    { organizationId: organizationId! },
    { enabled: !!organizationId, staleTime: 60_000 }
  );
  // Advisory is every module but Studio: a studio with Studio alone has no Advisory view, and
  // neither has a collaborator the owner closed Advisory to.
  const hasAdvisory =
    !!modules?.some((key) => key !== MODULE_KEYS.STUDIO) && !!access.data?.canOpenAdvisory;
  const view = hasAdvisory && query.get('vista') === 'advisory' ? 'advisory' : 'studio';
  const owner = ownerChoice ?? (access.data && !access.data.canManage ? (userId ?? 'all') : 'all');
  const sort = sorting[0];
  const { data, isLoading, error } = trpc.studio.clients.list.useQuery(
    {
      organizationId: organizationId!,
      page,
      pageSize: PAGE_SIZE,
      search: searchValue.trim() || undefined,
      archived: status === 'archived',
      review: status === 'review' || undefined,
      kind:
        status === 'active' || status === 'archived' || status === 'review' ? undefined : status,
      ownerUserId: owner === 'all' ? undefined : owner,
      advisory: view === 'advisory' || undefined,
      sortBy: sort?.id === 'nextDue' ? 'nextDue' : 'name',
      sortDirection: sort?.desc ? 'desc' : 'asc',
    },
    {
      // The member's default filter needs their access first: one request, not two.
      enabled: !!organizationId && (ownerChoice !== null || !!access.data),
      placeholderData: (previous) => previous,
      staleTime: 30_000,
    }
  );
  const update = trpc.studio.clients.update.useMutation({
    onSuccess: (saved, input) => {
      void utils.studio.clients.invalidate();
      toast.success(
        input.data.archived === undefined
          ? 'Responsabile aggiornato'
          : saved?.archivedAt
            ? 'Cliente segnato come non attivo'
            : 'Cliente riattivato'
      );
    },
    onError: (failure) => toast.error(failure.message),
  });

  const rowMembers = members.map((member) => ({
    value: member.userId,
    label: member.user.name || member.user.email,
    image: member.user.image,
  }));
  const filterMembers = rowMembers.map((member) =>
    member.value === userId ? { ...member, label: 'I miei clienti' } : member
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-3 sm:p-4">
      <header className="flex shrink-0 items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">
          Clienti
          {data && (
            <span className="text-muted-foreground ml-2 text-sm font-normal">{data.total}</span>
          )}
        </h1>
        <Button
          size="sm"
          onClick={() => setCreating(true)}
          disabled={!organizationId || !access.data}
        >
          <Plus className="size-4" />
          Nuovo cliente
        </Button>
      </header>
      {hasAdvisory && (
        <nav aria-label="Vista" className="flex shrink-0 gap-1">
          {(
            [
              ['studio', 'Studio', `${base}/clienti`],
              ['advisory', 'Advisory', `${base}/clienti?vista=advisory`],
            ] as const
          ).map(([key, label, href]) => (
            <Button key={key} size="sm" asChild variant={view === key ? 'secondary' : 'ghost'}>
              <Link
                href={href}
                onClick={goToFirstPage}
                aria-current={view === key ? 'page' : undefined}
              >
                {label}
              </Link>
            </Button>
          ))}
        </nav>
      )}
      <ClientsFilters
        search={inputValue}
        onSearch={filtered(setSearchValue)}
        status={status}
        onStatus={filtered(setStatus)}
        owner={owner}
        onOwner={filtered(setOwner)}
        members={filterMembers}
        showOwner={access.data?.scope !== 'assigned'}
      />
      {error ? (
        <p className="text-destructive py-16 text-center text-sm">
          Non è stato possibile caricare i clienti. {error.message}
        </p>
      ) : isLoading || !data || !organizationId ? (
        <ClientsSkeleton />
      ) : view === 'advisory' && !data.total && !searchValue.trim() && status === 'active' ? (
        <Empty>Nessun cliente dello studio è ancora collegato a un’azienda in Advisory.</Empty>
      ) : (
        <ClientsDataTable
          base={base}
          advisoryBase={hasAdvisory ? `/org/${slug}/company` : undefined}
          clients={data.items}
          total={data.total}
          page={page}
          pageSize={PAGE_SIZE}
          onPage={setPage}
          sorting={sorting}
          onSorting={filtered(setSorting)}
          members={rowMembers}
          onOwner={(client, ownerUserId) =>
            update.mutate({ organizationId, clientId: client.id, data: { ownerUserId } })
          }
          onEdit={setEditing}
          onArchive={(client) =>
            update.mutate({
              organizationId,
              clientId: client.id,
              data: { archived: !client.archivedAt },
            })
          }
        />
      )}
      {creating && organizationId && access.data && (
        <NewClientWizard
          organizationId={organizationId}
          base={base}
          onClose={() => setCreating(false)}
        />
      )}
      {editing && organizationId && (
        <ClientFormDialog
          organizationId={organizationId}
          client={editing}
          onClose={() => setEditing(undefined)}
        />
      )}
    </div>
  );
}
