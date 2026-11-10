import Link from 'next/link';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpRight, MoreHorizontal } from 'lucide-react';

import { studioClientDeadline } from '@/lib/studio/client-deadline';
import { studioDayLabel } from '@/lib/studio/labels';
import type { StudioClient } from '@/lib/types/studio';
import { cn, getInitialsForHome } from '@/lib/utils';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { ClientKindBadge } from '../../components/client-kind-badge';

/** A row of the list: the client, its open practices and the next one due. */
export type StudioClientRow = StudioClient & {
  openPractices: number;
  nextDueOn: string | null;
  nextDueTitle: string | null;
};

// Radix Select has no empty value: «nobody» travels as this key.
const NOBODY = 'none';

export function studioClientColumns({
  base,
  advisoryBase,
  members,
  onOwner,
  onEdit,
  onArchive,
}: {
  base: string;
  /** Where an Advisory company opens: `${advisoryBase}/${companyId}`; none hides «Entra in Advisory». */
  advisoryBase?: string;
  members: { value: string; label: string; image?: string | null }[];
  onOwner: (client: StudioClientRow, ownerUserId: string | null) => void;
  onEdit: (client: StudioClientRow) => void;
  onArchive: (client: StudioClientRow) => void;
}): ColumnDef<StudioClientRow>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Cliente',
      cell: ({ row }) => (
        <Link
          href={`${base}/clienti/${row.original.id}`}
          className="focus-visible:ring-ring/50 block max-w-72 min-w-40 truncate rounded-sm font-medium after:absolute after:inset-0 focus-visible:ring-[3px] focus-visible:outline-none"
          title={row.original.name}
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      id: 'kind',
      header: 'Tipo cliente',
      enableSorting: false,
      cell: ({ row }) => <ClientKindBadge kind={row.original.kind} />,
    },
    {
      id: 'taxCode',
      header: 'Codice fiscale',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs whitespace-nowrap tabular-nums">
          {row.original.taxCode || 'Non indicato'}
        </span>
      ),
    },
    {
      id: 'owner',
      header: 'Collaboratori',
      enableSorting: false,
      cell: ({ row }) => {
        const member = members.find((item) => item.value === row.original.ownerUserId);
        return (
          <div className="relative z-10">
            <Select
              value={row.original.ownerUserId ?? NOBODY}
              onValueChange={(value) => onOwner(row.original, value === NOBODY ? null : value)}
            >
              <SelectTrigger
                aria-label={`Collaboratore di ${row.original.name}`}
                className="bg-primary/10 text-primary h-7 w-fit max-w-56 gap-2 border-transparent px-2 text-xs shadow-none"
              >
                <SelectValue placeholder="Da assegnare">
                  {member ? (
                    <span className="flex min-w-0 items-center gap-1.5">
                      <Avatar className="size-5">
                        <AvatarImage src={member.image ?? undefined} alt="" />
                        <AvatarFallback className="bg-primary/15 text-primary text-[9px]">
                          {getInitialsForHome(member.label)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{member.label}</span>
                    </span>
                  ) : row.original.ownerUserId ? (
                    'Collaboratore non disponibile'
                  ) : (
                    'Da assegnare'
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NOBODY}>Da assegnare</SelectItem>
                {members.map((entry) => (
                  <SelectItem key={entry.value} value={entry.value}>
                    <span className="flex items-center gap-2">
                      <Avatar className="size-5">
                        <AvatarImage src={entry.image ?? undefined} alt="" />
                        <AvatarFallback className="text-[9px]">
                          {getInitialsForHome(entry.label)}
                        </AvatarFallback>
                      </Avatar>
                      {entry.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      },
    },
    {
      id: 'practices',
      header: 'Pratiche aperte',
      enableSorting: false,
      cell: ({ row }) => (
        <Link
          href={`${base}/clienti/${row.original.id}/pratiche`}
          className="text-primary relative z-10 text-sm tabular-nums hover:underline"
          aria-label={`${row.original.openPractices} pratiche aperte di ${row.original.name}`}
        >
          {row.original.openPractices}
        </Link>
      ),
    },
    {
      id: 'nextDue',
      accessorKey: 'nextDueOn',
      sortDescFirst: false,
      header: 'Prossima scadenza',
      cell: ({ row }) => {
        if (!row.original.nextDueOn)
          return <span className="text-muted-foreground text-xs">Nessuna</span>;
        const urgency = studioClientDeadline({ dueOn: row.original.nextDueOn });
        const date = studioDayLabel(row.original.nextDueOn);
        return (
          <Link
            href={`${base}/clienti/${row.original.id}`}
            className="relative z-10"
            title={`${date}: ${urgency.label}`}
            aria-label={`${date}: ${urgency.label}`}
          >
            <Badge
              variant="secondary"
              className={cn(
                'px-2 py-0 text-xs font-normal whitespace-nowrap tabular-nums',
                urgency.tone
              )}
            >
              {date}
              <span className="sr-only">: {urgency.label}</span>
            </Badge>
          </Link>
        );
      },
    },
    {
      id: 'nextDueTitle',
      header: 'Attività in scadenza',
      enableSorting: false,
      cell: ({ row }) => (
        <span
          title={row.original.nextDueTitle ?? undefined}
          className="block max-w-56 truncate text-xs"
        >
          {row.original.nextDueTitle || 'Nessuna'}
        </span>
      ),
    },
    {
      id: 'actions',
      enableSorting: false,
      header: () => <span className="sr-only">Azioni</span>,
      cell: ({ row }) => (
        <div className="relative z-10 flex items-center justify-end gap-1">
          {advisoryBase && row.original.clientCompanyId && (
            <Button asChild variant="ghost" size="icon" className="size-7">
              <Link
                href={`${advisoryBase}/${row.original.clientCompanyId}`}
                aria-label={`Entra in Advisory: ${row.original.name}`}
                title="Entra in Advisory"
              >
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label={`Altre azioni ${row.original.name}`}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`${base}/clienti/${row.original.id}`}>Apri scheda</Link>
              </DropdownMenuItem>
              {advisoryBase && row.original.clientCompanyId && (
                <DropdownMenuItem asChild>
                  <Link href={`${advisoryBase}/${row.original.clientCompanyId}`}>
                    Entra in Advisory
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={() => onEdit(row.original)}>Modifica</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onArchive(row.original)}>
                {row.original.archivedAt ? 'Riattiva' : 'Segna come non attivo'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
