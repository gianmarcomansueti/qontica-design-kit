'use client';
import { useState } from 'react';

import Link from 'next/link';

import { ArrowRight, CalendarClock, FileText, MessageSquare, Sparkles, Users } from 'lucide-react';

import { studioShortWhenLabel } from '@/lib/studio/availability';
import { studioClientDeadline } from '@/lib/studio/client-deadline';
import { studioDayLabel } from '@/lib/studio/labels';
import { trpc } from '@/lib/trpc/client';
import type { StudioClient } from '@/lib/types/studio';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { Status } from '../../components/ui';

export function ClientOverview({
  organizationId,
  base,
  client,
  today,
  onNewPractice,
}: {
  organizationId: string;
  base: string;
  client: StudioClient;
  today: string;
  onNewPractice: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const overview = trpc.studio.clients.overview.useQuery(
    { organizationId, clientId: client.id, today },
    { staleTime: 30_000 }
  );
  const data = overview.data;
  const clientBase = `${base}/clienti/${client.id}`;
  if (overview.error) return <p className="text-destructive text-sm">{overview.error.message}</p>;
  if (!data)
    return (
      <div className="space-y-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-52 w-full" />
      </div>
    );
  const priorities = [
    ...data.waitingStudio.map((item) => ({ ...item, owner: 'Studio' })),
    ...data.waitingClient.map((item) => ({ ...item, owner: 'Cliente' })),
  ];
  return (
    <div className="space-y-4">
      <section
        className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4"
        aria-label="Briefing del cliente"
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="text-primary size-4" />
            Briefing cliente
          </h2>
          {data.briefing && (
            <Button
              size="sm"
              variant="ghost"
              aria-expanded={expanded}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Riduci' : 'Leggi tutto'}
              <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
        <p
          className={`text-sm leading-relaxed whitespace-pre-line ${expanded ? '' : 'line-clamp-3'}`}
        >
          {data.briefing?.body ?? 'Nessun briefing salvato per oggi.'}
        </p>
      </section>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Adempimenti e pratiche', tab: 'pratiche', icon: CalendarClock },
          { label: 'Documenti', tab: 'documenti', icon: FileText },
          { label: 'Comunicazioni', tab: 'comunicazioni', icon: MessageSquare },
          { label: 'Contatti e accessi', tab: 'contatti', icon: Users },
        ].map((item) => (
          <Link
            key={item.tab}
            href={`${clientBase}/${item.tab}`}
            className="bg-muted/40 hover:bg-primary/10 flex items-center gap-2 rounded-md px-3 py-3 text-sm font-medium"
          >
            <item.icon className="text-primary size-4" />
            {item.label}
            <ArrowRight className="ml-auto size-4" />
          </Link>
        ))}
      </div>
      {data.nextAppointment && (
        <div className="bg-muted/30 flex flex-wrap items-center gap-3 rounded-md p-3 text-sm">
          <CalendarClock className="size-4" />
          <strong>Prossimo appuntamento</strong>
          <span>{studioShortWhenLabel(data.nextAppointment.startsAt)}</span>
          <span>{data.nextAppointment.memberName}</span>
          {data.nextAppointment.href && (
            <Button asChild size="sm" variant="ghost" className="ml-auto">
              <Link href={`${base}/${data.nextAppointment.href}`}>
                Apri calendario
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      )}
      <section className="space-y-2" aria-label="Priorità operative">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Priorità operative</h2>
          {data.actions.newPractice && !client.archivedAt && (
            <Button size="sm" onClick={onNewPractice}>
              Nuova pratica
            </Button>
          )}
        </div>
        {!priorities.length ? (
          <p className="text-muted-foreground py-4 text-sm">Nessuna attività in attesa.</p>
        ) : (
          <div className="isolate max-h-[40dvh] overflow-y-auto">
            <table className="[&_th]:bg-background w-full table-fixed text-left text-xs">
              <thead className="bg-background sticky top-0 z-20">
                <tr>
                  <th className="p-2">Attività</th>
                  <th className="p-2">Stato</th>
                  <th className="hidden w-24 p-2 md:table-cell">Documenti</th>
                  <th className="w-28 p-2">Scadenza</th>
                  <th className="hidden p-2 sm:table-cell">Collaboratore</th>
                  <th className="hidden w-24 p-2 lg:table-cell">In attesa di</th>
                </tr>
              </thead>
              <tbody>
                {priorities.map((item) => (
                  <tr
                    key={`${item.kind}:${item.id}`}
                    className="hover:bg-primary/15 relative border-b"
                  >
                    <td className="p-2 font-medium break-words">
                      <Link href={`${base}/${item.href}`} className="after:absolute after:inset-0">
                        {item.title}
                      </Link>
                      <span className="text-muted-foreground mt-1 block font-normal sm:hidden">
                        {item.holderName || 'Da assegnare'}
                      </span>
                    </td>
                    <td className="p-2 break-words">
                      <Badge variant="secondary" className="max-w-full whitespace-normal">
                        {item.phaseLabel || 'Da completare'}
                      </Badge>
                      <span className="text-muted-foreground mt-1 block lg:hidden">
                        In attesa: {item.owner}
                      </span>
                      <span className="text-muted-foreground mt-1 block md:hidden">
                        {item.documentsTotal
                          ? `Documenti: ${item.documentsDone ?? 0}/${item.documentsTotal}`
                          : 'Nessun documento richiesto'}
                      </span>
                    </td>
                    <td className="hidden p-2 tabular-nums md:table-cell">
                      {item.documentsTotal
                        ? `${item.documentsDone ?? 0}/${item.documentsTotal}`
                        : 'Non richiesti'}
                    </td>
                    <td className="p-2">
                      {item.dueOn ? (
                        <Badge
                          variant="secondary"
                          className={studioClientDeadline({ dueOn: item.dueOn }).tone}
                        >
                          {studioDayLabel(item.dueOn)}
                        </Badge>
                      ) : (
                        'Non prevista'
                      )}
                    </td>
                    <td className="hidden p-2 break-words sm:table-cell">
                      {item.holderName || 'Da assegnare'}
                    </td>
                    <td className="hidden p-2 lg:table-cell">
                      <Status>{item.owner}</Status>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
