'use client';

import { Suspense, useState } from 'react';

import Link from 'next/link';

import { CheckCircle2, Files, Loader2, MessagesSquare, Pencil, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { studioClientDeadline } from '@/lib/studio/client-deadline';
import { studioDayLabel, studioLocalToday } from '@/lib/studio/labels';
import { studioPhaseHasTimer } from '@/lib/studio/timer';
import { trpc } from '@/lib/trpc/client';

import { useCurrentOrganization } from '@/hooks/use-current-organization';
import { useOrganization } from '@/hooks/use-organization';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { PanelDocuments } from '../../adempimenti/components/obligation-client-workspace';
import { PhaseTimer } from '../../adempimenti/components/phase-timer';
import { StudioClientArchive } from '../../clienti/components/client-archive';
import { ClientKindBadge } from '../../components/client-kind-badge';
import { StudioArchiveLink } from '../../components/studio-archive-link';
import { Status } from '../../components/ui';
import { Inbox } from '../../comunicazioni/components/inbox';
import { VerificationDialog } from './practice-dialogs';
import { PracticeFormDialog } from './practice-form-dialog';
import { practiceState } from './practices-columns';

function DetailSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-4">
      <Skeleton className="h-9 w-80 max-w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="min-h-0 w-full flex-1" />
    </div>
  );
}

export function StudioPracticeDetail({ base, practiceId }: { base: string; practiceId: string }) {
  const { organizationId } = useCurrentOrganization();
  const { members } = useOrganization();
  const [today] = useState(studioLocalToday);
  const [tab, setTab] = useState('documents');
  const [editing, setEditing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [messageId, setMessageId] = useState<string>();
  const utils = trpc.useUtils();
  const delivery = trpc.studio.deliveries.get.useQuery(
    { organizationId: organizationId!, practiceId },
    {
      enabled: !!organizationId,
      staleTime: 15_000,
      refetchInterval: (query) => (query.state.data?.sent?.status === 'pending' ? 4000 : false),
    }
  );
  const finalizedAt = delivery.data?.sent?.finalizedAt;
  const practice = trpc.studio.practices.get.useQuery(
    { organizationId: organizationId!, practiceId },
    {
      enabled: !!organizationId,
      staleTime: 30_000,
      refetchInterval: (query) =>
        finalizedAt &&
        !query.state.data?.closedAt &&
        finalizedAt.getTime() > query.state.dataUpdatedAt
          ? 2000
          : false,
    }
  );
  const refresh = () => {
    void utils.studio.practices.invalidate();
    void utils.studio.files.invalidate();
  };
  const update = trpc.studio.practices.update.useMutation({
    onSuccess: (saved) => {
      refresh();
      toast.success(saved?.closedAt ? 'Pratica chiusa' : 'Pratica aggiornata');
    },
    onError: (error) => toast.error(error.message),
  });
  if (practice.error)
    return <p className="text-destructive p-4 text-sm">{practice.error.message}</p>;
  if (!practice.data || !organizationId) return <DetailSkeleton />;
  const p = practice.data;
  const isClosed = !!p.closedAt;
  const owner = members.find((member) => member.userId === p.ownerUserId);
  const deadline = p.dueOn ? studioClientDeadline({ dueOn: p.dueOn }) : null;
  const ownerName = owner?.user.name || owner?.user.email || 'Da assegnare';
  const identityExpired = !!p.identityExpiresOn && p.identityExpiresOn < today;
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-3 overflow-hidden p-3 sm:p-4">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Link
            href={`${base}/clienti/${p.clientId}`}
            className="bg-primary/15 text-foreground rounded-md px-3 py-1 text-lg font-semibold"
          >
            {p.clientName}
          </Link>
          <h1 className="min-w-0 truncate text-lg font-semibold">{p.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isClosed ? 'outline' : 'default'}
            disabled={update.isPending}
            onClick={() =>
              update.mutate({ organizationId, practiceId, data: { closed: !isClosed } })
            }
          >
            {update.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : isClosed ? (
              <RotateCcw className="size-3.5" />
            ) : (
              <CheckCircle2 className="size-3.5" />
            )}
            {isClosed ? 'Riapri pratica' : 'Chiudi pratica'}
          </Button>
          {p.obligationId && (
            <Button size="sm" variant="outline" asChild>
              <Link href={`${base}/adempimenti/${p.obligationId}`}>Adempimento</Link>
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="size-3.5" />
            Modifica
          </Button>
        </div>
      </header>
      <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs">
        <ClientKindBadge kind={p.clientKind} />
        <Status>{practiceState(p, today)}</Status>
        <Badge variant="secondary" className={deadline?.tone} title={deadline?.label}>
          {p.dueOn ? `Scadenza ${studioDayLabel(p.dueOn)}` : 'Scadenza da definire'}
        </Badge>
        <Badge variant="secondary" className="gap-1.5">
          {owner && (
            <Avatar className="size-5">
              <AvatarImage src={owner.user.image ?? undefined} alt="" />
              <AvatarFallback className="text-[10px]">
                {ownerName
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          {ownerName}
        </Badge>
      </div>
      {!isClosed && studioPhaseHasTimer(p.phaseKey ?? 'lavorazione') && (
        <div className="shrink-0">
          <PhaseTimer
            organizationId={organizationId}
            practiceId={practiceId}
            phaseKey={p.phaseKey ?? 'lavorazione'}
            disabled={false}
          />
        </div>
      )}
      {delivery.data?.draft && (
        <p className="text-muted-foreground text-sm">
          Esiste una precedente bozza di consegna: il suo invio chiude ancora la pratica.{' '}
          <Link
            className="text-primary underline"
            href={`${base}/comunicazioni?cartella=draft&apri=c:${delivery.data.draft.id}`}
          >
            Apri bozza precedente
          </Link>
        </p>
      )}
      {delivery.data?.sent?.status === 'pending' && (
        <p className="text-muted-foreground text-sm">
          Una precedente consegna è già in invio e chiuderà la pratica al completamento.
        </p>
      )}
      <Tabs value={tab} onValueChange={setTab} className="min-h-0 min-w-0 flex-1 gap-2">
        <TabsList
          aria-label="Sezioni della pratica"
          className="h-9 w-full shrink-0 justify-start overflow-x-auto"
        >
          <TabsTrigger value="documents">
            <Files className="size-3.5" />
            Raccolta documentale
          </TabsTrigger>
          <TabsTrigger value="archive">
            <Files className="size-3.5" />
            Archivio
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessagesSquare className="size-3.5" />
            Comunicazioni
          </TabsTrigger>
        </TabsList>
        <TabsContent value="documents" className="min-h-0 overflow-y-auto">
          {p.templateBaseKey === 'aml' && (
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span>
                Documento identità:{' '}
                {p.identityExpiresOn
                  ? studioDayLabel(p.identityExpiresOn)
                  : 'Scadenza da registrare'}
              </span>
              {identityExpired && <Status>Da aggiornare</Status>}
              <Button variant="outline" size="sm" onClick={() => setVerifying(true)}>
                Aggiorna verifica
              </Button>
            </div>
          )}
          <PanelDocuments
            organizationId={organizationId}
            client={{ practiceId: p.id, clientId: p.clientId, closedAt: p.closedAt }}
            operational={!isClosed}
            compactToolbar
            onSaved={(id) => {
              setMessageId(id);
              setTab('messages');
            }}
          />
        </TabsContent>
        <TabsContent
          value="archive"
          className="min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden data-[state=active]:flex"
        >
          <div className="flex shrink-0 justify-end">
            <StudioArchiveLink clientId={p.clientId} practiceId={p.id} />
          </div>
          <StudioClientArchive
            key={p.id}
            organizationId={organizationId}
            clientId={p.clientId}
            initialPracticeId={p.id}
          />
        </TabsContent>
        <TabsContent value="messages" className="min-h-0 overflow-hidden">
          <Suspense fallback={<Skeleton className="h-full w-full" />}>
            <Inbox
              practiceContext={{ practiceId: p.id, clientId: p.clientId }}
              initialMessage={messageId}
            />
          </Suspense>
        </TabsContent>
      </Tabs>
      {editing && (
        <PracticeFormDialog
          organizationId={organizationId}
          practice={p}
          onClose={() => setEditing(false)}
        />
      )}
      {verifying && (
        <VerificationDialog
          organizationId={organizationId}
          practice={p}
          onClose={() => setVerifying(false)}
        />
      )}
    </div>
  );
}
