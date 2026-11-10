'use client';

import { Suspense, useState } from 'react';

import Link from 'next/link';

import { Archive, ArrowUpRight, Loader2, Mail, Pencil, Plus, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { STUDIO_CLIENT_KIND_LABELS, studioLocalToday } from '@/lib/studio/labels';
import { trpc } from '@/lib/trpc/client';

import { useCurrentOrganization } from '@/hooks/use-current-organization';
import { useOrganization } from '@/hooks/use-organization';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { PageTitle, SectionTabs, Status } from '../../components/ui';
import { Inbox } from '../../comunicazioni/components/inbox';
import { PracticeFormDialog } from '../../pratiche/components/practice-form-dialog';
import { ClientActivities } from './client-activities';
import { StudioClientArchive } from './client-archive';
import { ClientContacts } from './client-contacts';
import { ClientFormDialog } from './client-form-dialog';
import { ClientHistoryDialog } from './client-history-dialog';
import { ClientOverview } from './client-overview';
import { ClientPractices } from './client-practices';
import { ClientRegistry } from './client-registry';
import type { StudioClientTab } from './client-tabs';

function DetailSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-5 w-96 max-w-full" />
      <div className="flex gap-6 border-b pb-3">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-5 w-24" />
        ))}
      </div>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}

/** A client's page: header with its actions, then one tab per address (HANDOFF §4). */
export function StudioClientDetail({
  base,
  clientId,
  tab: requestedTab,
}: {
  base: string;
  clientId: string;
  tab: StudioClientTab;
}) {
  const { organizationId } = useCurrentOrganization();
  const { members } = useOrganization();
  const [editing, setEditing] = useState(false);
  const [creatingPractice, setCreatingPractice] = useState(false);
  const [exportingHistory, setExportingHistory] = useState(false);
  const [today] = useState(studioLocalToday);
  const utils = trpc.useUtils();
  const enabled = !!organizationId;
  const access = trpc.studio.access.me.useQuery(
    { organizationId: organizationId! },
    { enabled, staleTime: 60_000 }
  );
  const client = trpc.studio.clients.get.useQuery(
    { organizationId: organizationId!, clientId },
    { enabled, staleTime: 30_000 }
  );
  const archive = trpc.studio.clients.update.useMutation({
    onSuccess: (saved) => {
      void utils.studio.clients.invalidate();
      void utils.studio.clientContacts.invalidate();
      toast.success(saved?.archivedAt ? 'Cliente segnato come non attivo' : 'Cliente riattivato');
    },
    onError: (error) => toast.error(error.message),
  });

  if (client.error)
    return (
      <p className="text-destructive py-16 text-center text-sm">
        Non è stato possibile aprire il cliente. {client.error.message}
      </p>
    );
  if (!client.data || !organizationId || !access.data) return <DetailSkeleton />;

  const c = client.data;
  const canManage = access.data.canManage;
  // «Attività» is the owner's: a collaborator on its address reads the overview (HANDOFF §3).
  const tab = requestedTab === 'attivita' && !canManage ? '' : requestedTab;
  const owner = members.find((member) => member.userId === c.ownerUserId);
  const clientBase = `${base}/clienti/${clientId}`;

  return (
    <div
      className={
        tab === 'comunicazioni'
          ? 'flex h-full min-h-0 min-w-0 flex-col overflow-hidden'
          : tab === 'documenti'
            ? 'flex h-full min-h-0 min-w-0 flex-col overflow-hidden p-3 sm:p-4'
            : 'min-w-0'
      }
    >
      <div
        className={
          tab === 'comunicazioni' ? 'min-w-0 shrink-0 px-3 pt-3 sm:px-4' : 'min-w-0 shrink-0'
        }
      >
        <PageTitle
          actions={
            <>
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Pencil className="size-4" />
                Modifica
              </Button>
              {c.clientCompanyId && access.data.canOpenAdvisory && (
                <Button asChild variant="outline">
                  <Link href={`${base.replace(/\/studio$/, '/company')}/${c.clientCompanyId}`}>
                    Entra in Advisory
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              )}
              {!c.archivedAt && (
                <Button asChild variant="outline">
                  <Link href={`${base}/comunicazioni?apri=nuova&cliente=${clientId}`}>
                    <Mail className="size-4" />
                    Scrivi una mail
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                disabled={archive.isPending}
                onClick={() =>
                  archive.mutate({ organizationId, clientId, data: { archived: !c.archivedAt } })
                }
              >
                {archive.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : c.archivedAt ? (
                  <RotateCcw className="size-4" />
                ) : (
                  <Archive className="size-4" />
                )}
                {c.archivedAt ? 'Riattiva' : 'Segna come non attivo'}
              </Button>
              {!c.archivedAt && (
                <Button onClick={() => setCreatingPractice(true)}>
                  <Plus className="size-4" />
                  Nuova pratica
                </Button>
              )}
            </>
          }
        >
          {c.name}
        </PageTitle>
        <div className="-mt-2 mb-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <Status>{c.archivedAt ? 'Non attivo' : c.reviewNote ? 'Da verificare' : 'Attivo'}</Status>
          <span className="text-muted-foreground">{STUDIO_CLIENT_KIND_LABELS[c.kind]}</span>
          <span className="text-muted-foreground">CF {c.taxCode}</span>
          <span className="text-muted-foreground">
            Responsabile: {owner ? owner.user.name || owner.user.email : 'da assegnare'}
          </span>
        </div>

        <SectionTabs
          base={clientBase}
          current={tab}
          tabs={[
            { id: '', label: 'Panoramica' },
            { id: 'pratiche', label: 'Adempimenti e pratiche' },
            { id: 'documenti', label: 'Documenti' },
            { id: 'comunicazioni', label: 'Comunicazioni' },
            ...(canManage ? [{ id: 'attivita', label: 'Attività' }] : []),
            { id: 'contatti', label: 'Contatti e accessi' },
            { id: 'anagrafica', label: 'Anagrafica e mandato' },
          ]}
        />
      </div>

      {tab === '' && (
        <ClientOverview
          organizationId={organizationId}
          base={base}
          client={c}
          today={today}
          onNewPractice={() => setCreatingPractice(true)}
        />
      )}
      {tab === 'pratiche' && (
        <ClientPractices
          organizationId={organizationId}
          base={base}
          clientId={clientId}
          today={today}
        />
      )}
      {tab === 'documenti' && (
        <StudioClientArchive organizationId={organizationId} clientId={clientId} />
      )}
      {tab === 'comunicazioni' && (
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <Suspense fallback={<DetailSkeleton />}>
            <Inbox clientContext={clientId} />
          </Suspense>
        </div>
      )}
      {tab === 'attivita' && (
        <ClientActivities
          organizationId={organizationId}
          clientId={clientId}
          base={base}
          onExportHistory={() => setExportingHistory(true)}
        />
      )}
      {tab === 'contatti' && <ClientContacts organizationId={organizationId} client={c} />}
      {tab === 'anagrafica' && (
        <ClientRegistry
          organizationId={organizationId}
          client={c}
          onEdit={() => setEditing(true)}
        />
      )}

      {creatingPractice && (
        <PracticeFormDialog
          organizationId={organizationId}
          clientId={clientId}
          clientName={c.name}
          onClose={() => setCreatingPractice(false)}
        />
      )}
      {exportingHistory && (
        <ClientHistoryDialog
          organizationId={organizationId}
          client={c}
          today={today}
          onClose={() => setExportingHistory(false)}
        />
      )}
      {editing && (
        <ClientFormDialog
          organizationId={organizationId}
          client={c}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}
