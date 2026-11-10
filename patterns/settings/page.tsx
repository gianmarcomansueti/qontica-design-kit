'use client';

import { useRef } from 'react';

import { trpc } from '@/lib/trpc/client';
import { updateDisplayNameSchema } from '@/lib/trpc/schemas/user';
import { getInitials } from '@/lib/utils';

import { useProfileUpload } from '@/hooks/use-profile-upload';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { UserProfileAvatar } from '@/components/user-profile-avatar';

import {
  SettingsBlock,
  SettingsPage,
  SettingsRow,
  useAutosave,
  useDraft,
} from './components/settings-ui';

/** The person: picture, name, email. The name saves by itself. */
export default function ProfileSettings() {
  const utils = trpc.useUtils();
  const { data: user } = trpc.user.getUser.useQuery(undefined, { staleTime: 1000 * 60 * 2 });
  const { handleImageUpload, handleImageDelete, isUploading, isDeleting } = useProfileUpload();
  const fileInput = useRef<HTMLInputElement>(null);
  const update = trpc.user.updateDisplayName.useMutation({
    onSuccess: () => void utils.user.getUser.invalidate(),
  });
  const persisted = user?.displayName ?? '';
  const [displayName, setDisplayName] = useDraft(persisted);
  useAutosave(displayName, persisted, (value) => update.mutateAsync({ displayName: value }), {
    validate: (value) => updateDisplayNameSchema.safeParse({ displayName: value }).success,
  });

  return (
    <SettingsPage scope="Account" title="Profilo">
      <SettingsBlock title="Profilo">
        <SettingsRow label="Immagine profilo">
          {user ? (
            <UserProfileAvatar
              src={user.profileImageUrl}
              name={user.displayName ?? ''}
              initials={getInitials(user.displayName || user.email)}
              className="size-10 rounded-lg"
            />
          ) : (
            <Skeleton className="size-10 rounded-lg" />
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={isUploading || isDeleting || !user}
            onClick={() => fileInput.current?.click()}
          >
            {isUploading ? 'Caricamento…' : 'Carica immagine'}
          </Button>
          {user?.profileImageUrl && (
            <Button
              variant="link"
              className="h-auto p-0"
              disabled={isUploading || isDeleting}
              onClick={() => void handleImageDelete()}
            >
              Rimuovi
            </Button>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (event) => {
              await handleImageUpload(event);
              if (fileInput.current) fileInput.current.value = '';
            }}
          />
        </SettingsRow>
        <SettingsRow label="Nome visualizzato" htmlFor="displayName">
          {user ? (
            <Input
              id="displayName"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={100}
              className="sm:w-80"
            />
          ) : (
            <Skeleton className="h-9 w-80" />
          )}
        </SettingsRow>
        <SettingsRow label="Email">
          {user ? <span className="text-sm">{user.email}</span> : <Skeleton className="h-5 w-56" />}
        </SettingsRow>
      </SettingsBlock>
    </SettingsPage>
  );
}
