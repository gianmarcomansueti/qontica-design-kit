'use client';

import { Suspense, useState } from 'react';

import { useParams, useSearchParams } from 'next/navigation';

import { Plus } from 'lucide-react';

import { studioLocalToday } from '@/lib/studio/labels';
import { trpc } from '@/lib/trpc/client';

import { useAuth } from '@/hooks/use-auth';
import { useCurrentOrganization } from '@/hooks/use-current-organization';
import { useOrganization } from '@/hooks/use-organization';
import { useTablePagination } from '@/hooks/use-table-pagination';
import { useTableSearch } from '@/hooks/use-table-search';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { PracticeFormDialog } from './components/practice-form-dialog';
import { PracticesDataTable } from './components/practices-data-table';
import { PracticesFilters } from './components/practices-filters';

const PAGE_SIZE = 15;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/**
 * The list's states. `filtro` in the address picks one, so the home's tiles open the list
 * already filtered: `verificare`, `attesa`, `attenzione` are the tiles' rules, in SQL.
 */
const STATES = [
  { value: 'open', param: 'aperte', label: 'In corso' },
  { value: 'to_check', param: 'verificare', label: 'Da verificare' },
  { value: 'waiting', param: 'attesa', label: 'In attesa del cliente' },
  { value: 'attention', param: 'attenzione', label: 'Da attenzionare' },
  { value: 'overdue', param: 'ritardo', label: 'In ritardo' },
  { value: 'closed', param: 'chiuse', label: 'Chiuse' },
  { value: 'all', param: 'tutte', label: 'Tutte' },
] as const;
type State = (typeof STATES)[number]['value'];

function PracticesSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-11 w-full sm:max-w-xs" />
      {Array.from({ length: 8 }, (_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}

export default function StudioPracticesPage() {
  return (
    <Suspense
      fallback={
        <>
          <Skeleton className="mb-8 h-9 w-48" />
          <PracticesSkeleton />
        </>
      }
    >
      <StudioPractices />
    </Suspense>
  );
}

function StudioPractices() {
  const { slug } = useParams<{ slug: string }>();
  const query = useSearchParams();
  const base = `/org/${slug}/studio`;
  const { organizationId } = useCurrentOrganization();
  const { members } = useOrganization();
  const { userId } = useAuth();
  const [today] = useState(studioLocalToday);
  const [state, setState] = useState<State>(
    () => STATES.find((option) => option.param === query.get('filtro'))?.value ?? 'open'
  );
  // `responsabile` in the address wins; otherwise the owner starts on the whole studio and a
  // member on their own practices.
  const [ownerChoice, setOwner] = useState<string | null>(() => query.get('responsabile'));
  // `palla` in the address: only the practices whose ball is that user's, whoever owns them.
  const requestedBall = query.get('palla');
  const ballUserId = requestedBall && UUID.test(requestedBall) ? requestedBall : undefined;
  const [template, setTemplate] = useState('all');
  // `?nuova=1&cliente=<id>` opens «Nuova pratica» with the client already chosen.
  const requestedClient = query.get('cliente');
  const presetClientId =
    requestedClient && UUID.test(requestedClient) ? requestedClient : undefined;
  const [creating, setCreating] = useState(() => query.get('nuova') === '1');
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
  const owner =
    ownerChoice ??
    (!ballUserId && access.data && !access.data.canManage ? (userId ?? 'all') : 'all');
  const templates = trpc.studio.templates.list.useQuery(
    { organizationId: organizationId! },
    { enabled: !!organizationId, staleTime: 5 * 60_000 }
  );
  const { data, isLoading, error } = trpc.studio.practices.list.useQuery(
    {
      organizationId: organizationId!,
      today,
      // The practices of an obligation are worked from its page: here only the extra ones.
      extraOnly: true,
      page,
      pageSize: PAGE_SIZE,
      search: searchValue.trim() || undefined,
      state: state === 'all' ? undefined : state,
      ownerUserId: owner === 'all' ? undefined : owner,
      ballUserId,
      templateId: template === 'all' ? undefined : template,
    },
    {
      // The member's default filter needs their access first: one request, not two.
      enabled: !!organizationId && (ownerChoice !== null || !!access.data),
      placeholderData: (previous) => previous,
      staleTime: 30_000,
    }
  );

  const presetClient = trpc.studio.clients.get.useQuery(
    { organizationId: organizationId!, clientId: presetClientId! },
    { enabled: !!organizationId && !!presetClientId && creating, staleTime: 30_000 }
  );

  const memberOptions = members.map((member) => ({
    value: member.userId,
    label: member.user.name || member.user.email,
  }));
  const memberName = (userId: string | null) =>
    memberOptions.find((member) => member.value === userId)?.label ?? 'Da assegnare';

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-3 overflow-hidden p-3 sm:p-4">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">
          Pratiche{' '}
          {data && <span className="text-muted-foreground text-sm font-normal">{data.total}</span>}
        </h1>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setCreating(true)} disabled={!organizationId}>
            <Plus className="size-4" />
            Nuova pratica
          </Button>
        </div>
      </header>
      <div className="flex shrink-0 gap-1 overflow-x-auto">
        {STATES.map((option) => (
          <Button
            key={option.value}
            variant={state === option.value ? 'secondary' : 'ghost'}
            aria-pressed={state === option.value}
            size="sm"
            className="shrink-0 text-xs"
            onClick={() => filtered(setState)(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      <PracticesFilters
        search={inputValue}
        onSearch={filtered(setSearchValue)}
        owner={owner}
        onOwner={filtered(setOwner)}
        template={template}
        onTemplate={filtered(setTemplate)}
        members={memberOptions}
        templates={(templates.data ?? []).map((entry) => ({ value: entry.id, label: entry.title }))}
      />
      {error ? (
        <p className="text-destructive py-16 text-center text-sm">
          Non è stato possibile caricare le pratiche. {error.message}
        </p>
      ) : isLoading || !data ? (
        <PracticesSkeleton />
      ) : (
        <PracticesDataTable
          base={base}
          today={today}
          practices={data.items}
          total={data.total}
          page={page}
          pageSize={PAGE_SIZE}
          onPage={setPage}
          memberName={memberName}
        />
      )}
      {creating &&
        organizationId &&
        !(presetClientId && !presetClient.data && !presetClient.error) && (
          <PracticeFormDialog
            organizationId={organizationId}
            clientId={presetClient.data ? presetClientId : undefined}
            clientName={presetClient.data?.name}
            onClose={() => setCreating(false)}
          />
        )}
    </div>
  );
}
