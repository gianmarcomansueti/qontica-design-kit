import { STUDIO_CLIENT_KIND_LABELS } from '@/lib/studio/labels';
import type { StudioClientKind } from '@/lib/types/studio';

import { Pick, SearchField } from '../../components/ui';

/** Which clients the list shows: the active ones, the archived ones, those to check, or a type. */
export type ClientsStatusFilter = 'active' | 'archived' | 'review' | StudioClientKind;

export function ClientsFilters({
  search,
  onSearch,
  status,
  onStatus,
  owner,
  onOwner,
  members,
  showOwner,
}: {
  search: string;
  onSearch: (value: string) => void;
  status: ClientsStatusFilter;
  onStatus: (value: ClientsStatusFilter) => void;
  owner: string;
  onOwner: (value: string) => void;
  members: { value: string; label: string }[];
  /** A member who sees only their own clients has no other responsible to pick. */
  showOwner: boolean;
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 [&_input]:h-8 [&_input]:text-xs">
      <SearchField
        value={search}
        onChange={onSearch}
        placeholder="Cerca nome, codice fiscale o città"
      />
      <div className="flex min-w-0 flex-wrap gap-2 sm:ml-auto">
        <Pick
          label="Clienti da mostrare"
          className="h-8 text-xs"
          value={status}
          onChange={(value) => onStatus(value as ClientsStatusFilter)}
          options={[
            { value: 'active', label: 'Clienti attivi' },
            { value: 'archived', label: 'Non attivi' },
            { value: 'review', label: 'Da verificare' },
            ...Object.entries(STUDIO_CLIENT_KIND_LABELS).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
        />
        {showOwner && (
          <Pick
            label="Responsabile"
            className="h-8 text-xs"
            value={owner}
            onChange={onOwner}
            options={[{ value: 'all', label: 'Tutti i responsabili' }, ...members]}
          />
        )}
      </div>
    </div>
  );
}
