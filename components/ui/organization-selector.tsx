'use client';

import { useState } from 'react';

import { ChevronsUpDown, Loader2 } from 'lucide-react';

import { rememberActiveOrganization } from '@/lib/auth/client-session';
import { getInitials } from '@/lib/utils';

import { useAuth } from '@/hooks/use-auth';
import { useOrganizations } from '@/hooks/use-organizations';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const OrganizationSelector = () => {
  const { refetch: refetchSession } = useAuth();
  const { organizations } = useOrganizations();
  const [navigatingSlug, setNavigatingSlug] = useState<string | null>(null);

  const handleSelectOrg = async (org: { id: string; slug: string }) => {
    setNavigatingSlug(org.slug);
    try {
      await rememberActiveOrganization(org.id);
      await refetchSession();
      // The organization is in the URL: the next page works on it whatever the session says.
      window.location.href = `/org/${org.slug}/company`;
    } finally {
      setNavigatingSlug(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Select an organization
          <ChevronsUpDown className="ml-auto size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) rounded-lg">
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onSelect={(e) => {
              e.preventDefault();
              handleSelectOrg(org);
            }}
            disabled={navigatingSlug !== null}
            className="flex cursor-pointer items-center gap-2 p-2"
          >
            <Avatar className="h-6 w-6 rounded-md">
              {org.logo && <AvatarImage src={org.logo} alt={org.name} />}
              <AvatarFallback className="bg-primary text-primary-foreground rounded-md text-xs">
                {getInitials(org.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium">{org.name}</div>
            </div>
            {navigatingSlug === org.slug && (
              <Loader2 className="text-muted-foreground size-4 shrink-0 animate-spin" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
