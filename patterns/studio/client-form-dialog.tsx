'use client';

import { useForm, useWatch } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { z } from 'zod';

import {
  STUDIO_ACCOUNTING_REGIME_LABELS,
  STUDIO_CLIENT_KIND_LABELS,
  STUDIO_VAT_FREQUENCY_LABELS,
} from '@/lib/studio/labels';
import { trpc } from '@/lib/trpc/client';
import { studioClientFormSchema, studioClientFormToData } from '@/lib/trpc/schemas/studio';
import type { StudioClient } from '@/lib/types/studio';

import { useOrganization } from '@/hooks/use-organization';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';

import {
  ClientChoiceField,
  ClientCompanyField,
  ClientMandateFields,
  ClientTextField,
  labelOptions,
} from './client-fields';

type ClientForm = z.infer<typeof studioClientFormSchema>;

/**
 * Edits the registry of `client` in one dialog. The email is not here: it is the primary
 * contact's, changed from «Contatti e accessi». A new client goes through the wizard.
 */
export function ClientFormDialog({
  organizationId,
  client,
  onClose,
}: {
  organizationId: string;
  client: StudioClient;
  onClose: () => void;
}) {
  const { members } = useOrganization();
  const utils = trpc.useUtils();
  const form = useForm<ClientForm>({
    resolver: zodResolver(studioClientFormSchema),
    defaultValues: {
      name: client.name,
      kind: client.kind,
      taxCode: client.taxCode,
      vatNumber: client.vatNumber ?? '',
      city: client.city ?? '',
      email: client.email ?? '',
      accountingRegime: client.accountingRegime,
      vatFrequency: client.vatFrequency,
      ownerUserId: client.ownerUserId ?? '',
      clientCompanyId: client.clientCompanyId ?? '',
      address: client.address,
      pec: client.pec,
      mobilePhone: client.mobilePhone,
      birthDate: client.birthDate ?? '',
      signerName: client.signerName,
      signerTaxCode: client.signerTaxCode,
      signerBirthDate: client.signerBirthDate ?? '',
      signerRole: client.signerRole,
    },
  });
  const kind = useWatch({ control: form.control, name: 'kind' });
  // Only a business has an Advisory company: people and professionals do not (#68).
  const isBusiness = kind !== 'individual' && kind !== 'professional';
  // The signer proposed for a company: its primary contact, when it is not the client itself.
  const contacts = trpc.studio.clientContacts.list.useQuery(
    { organizationId, clientId: client.id },
    { staleTime: 30_000 }
  );
  const primary = contacts.data?.find((contact) => contact.isPrimary)?.name.trim();
  const proposal = primary && primary !== client.name.trim() ? primary : null;
  const update = trpc.studio.clients.update.useMutation({
    onSuccess: () => {
      void utils.studio.clients.invalidate();
      toast.success('Cliente aggiornato');
      onClose();
    },
    onError: (error) => toast.error(error.message),
  });

  const submit = form.handleSubmit((values) =>
    update.mutate({
      organizationId,
      clientId: client.id,
      // The email stays the primary contact's: the form does not send it.
      data: { ...studioClientFormToData(values), email: undefined },
    })
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifica cliente</DialogTitle>
          <DialogDescription>
            Il codice fiscale identifica il cliente nello studio: non possono esserci due clienti
            con lo stesso.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-8">
          <FieldGroup className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ClientTextField control={form.control} name="name" label="Nome o ragione sociale" />
            </div>
            <ClientChoiceField
              control={form.control}
              name="kind"
              label="Tipo di cliente"
              options={labelOptions(STUDIO_CLIENT_KIND_LABELS)}
            />
            <ClientTextField control={form.control} name="taxCode" label="Codice fiscale" />
            <ClientTextField control={form.control} name="vatNumber" label="Partita IVA" />
            <ClientTextField control={form.control} name="city" label="Comune" />
            <ClientChoiceField
              control={form.control}
              name="accountingRegime"
              label="Contabilità"
              options={labelOptions(STUDIO_ACCOUNTING_REGIME_LABELS)}
            />
            <ClientChoiceField
              control={form.control}
              name="vatFrequency"
              label="Liquidazione IVA"
              options={labelOptions(STUDIO_VAT_FREQUENCY_LABELS)}
            />
            <div className="sm:col-span-2">
              <ClientChoiceField
                control={form.control}
                name="ownerUserId"
                label="Responsabile"
                options={members.map((member) => ({
                  value: member.userId,
                  label: member.user.name || member.user.email,
                }))}
              />
            </div>
            {isBusiness && (
              <div className="sm:col-span-2">
                <ClientCompanyField
                  control={form.control}
                  name="clientCompanyId"
                  organizationId={organizationId}
                />
              </div>
            )}
            <div className="space-y-8 pt-2 sm:col-span-2">
              <ClientMandateFields control={form.control} kind={kind} proposal={proposal} />
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={update.isPending}>
              Annulla
            </Button>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending && <Loader2 className="size-4 animate-spin" />}
              {update.isPending ? 'Salvataggio...' : 'Salva'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
