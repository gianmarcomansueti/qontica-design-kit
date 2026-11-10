'use client';

import { Suspense } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Bell,
  Briefcase,
  Building2,
  CreditCard,
  type LucideIcon,
  Monitor,
  Shield,
  User,
  Users,
} from 'lucide-react';

import { MODULE_KEYS } from '@/lib/modules/modules';
import { ORG_ROLES } from '@/lib/types/organization';
import { cn, getInitials } from '@/lib/utils';

import { useOrganization } from '@/hooks/use-organization';
import { usePlanAccess } from '@/hooks/use-plan-access';
import { useUser } from '@/hooks/use-user';

import { Skeleton } from '@/components/ui/skeleton';
import { UserProfileAvatar } from '@/components/user-profile-avatar';

import { SaveStatusProvider } from './components/settings-ui';

type Item = { id: string; label: string; icon: LucideIcon };

const ROLE_LABEL: Record<string, string> = {
  owner: 'Titolare',
  admin: 'Amministratore',
  member: 'Membro',
};

/**
 * The one place for every setting. On the left two groups, the person and the organization
 * they work in, each entry with what it holds; on the right the section. A member sees the
 * organization and its members, the owner also the billing, Studio when the organization holds
 * it. Outside `/org/[slug]`, the organization is the one worked in last. The pages save by
 * themselves: the header of each says where the save is.
 */
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { organization, currentUserRole, isLoading } = useOrganization();
  const { hasModule, isLoading: modulesLoading } = usePlanAccess();
  const page = pathname.replace(/^\/settings\/?/, '').split('/')[0] ?? '';

  const account: Item[] = [
    { id: '', label: 'Profilo', icon: User },
    { id: 'appearance', label: 'Aspetto', icon: Monitor },
    { id: 'notifications', label: 'Avvisi', icon: Bell },
    { id: 'security', label: 'Sicurezza', icon: Shield },
  ];
  const workspace: Item[] = organization
    ? [
        { id: 'organization', label: 'Organizzazione', icon: Building2 },
        { id: 'members', label: 'Membri', icon: Users },
        ...(hasModule(MODULE_KEYS.STUDIO)
          ? [{ id: 'studio', label: 'Qontica Studio', icon: Briefcase }]
          : []),
        ...(currentUserRole === ORG_ROLES.OWNER
          ? [{ id: 'billing', label: 'Fatturazione', icon: CreditCard }]
          : []),
      ]
    : [];

  const entry = ({ id, label, icon: Icon }: Item) => {
    const current = page === id;
    return (
      <li key={id}>
        <Link
          href={`/settings${id ? `/${id}` : ''}`}
          aria-current={current ? 'page' : undefined}
          className={cn(
            'focus-visible:ring-ring flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none',
            current
              ? 'bg-muted text-foreground font-medium'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
          )}
        >
          <Icon aria-hidden className="size-4 shrink-0" />
          {label}
        </Link>
      </li>
    );
  };
  const chip = ({ id, label, icon: Icon }: Item) => {
    const current = page === id;
    return (
      <Link
        key={id}
        href={`/settings${id ? `/${id}` : ''}`}
        aria-current={current ? 'page' : undefined}
        className={cn(
          'flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm',
          current ? 'bg-muted font-medium' : 'text-muted-foreground'
        )}
      >
        <Icon aria-hidden className="size-4 shrink-0" />
        {label}
      </Link>
    );
  };

  const waiting = (isLoading || modulesLoading) && !organization;

  return (
    <SaveStatusProvider>
      <div className="grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-14">
        <aside className="hidden lg:block">
          <div className="sticky top-0 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Impostazioni</h2>
            </div>
            <nav aria-label="Impostazioni" className="space-y-7">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 px-3">
                  <UserProfileAvatar
                    src={user?.profileImageUrl ?? null}
                    name={user?.displayName ?? ''}
                    initials={getInitials(user?.displayName || user?.email)}
                    className="size-6 rounded-md text-[10px]"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Account</p>
                    <p className="text-muted-foreground truncate text-xs">{user?.email}</p>
                  </div>
                </div>
                <ul className="space-y-0.5">{account.map(entry)}</ul>
              </div>
              {waiting ? (
                <div className="space-y-2 px-3" aria-hidden>
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                organization && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 px-3">
                      <span className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold">
                        {getInitials(organization.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{organization.name}</p>
                        <p className="text-muted-foreground truncate text-xs">
                          Organizzazione
                          {currentUserRole ? ` · ${ROLE_LABEL[currentUserRole]}` : ''}
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-0.5">{workspace.map(entry)}</ul>
                  </div>
                )
              )}
            </nav>
          </div>
        </aside>
        <nav aria-label="Impostazioni" className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:hidden">
          {[...account, ...workspace].map(chip)}
        </nav>
        <div className="min-w-0">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>{children}</Suspense>
        </div>
      </div>
    </SaveStatusProvider>
  );
}
