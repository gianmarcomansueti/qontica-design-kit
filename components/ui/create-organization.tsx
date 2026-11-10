'use client';

import { useState } from 'react';

import { Plus } from 'lucide-react';

import { useOrganizations } from '@/hooks/use-organizations';

import { CreateOrgDialog } from '@/components/create-org-dialog';
import { Button } from '@/components/ui/button';

export const CreateOrganization = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { organizations } = useOrganizations();

  if (organizations.length >= 1) {
    return null;
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
        <Plus />
        Create Organization
      </Button>
      <CreateOrgDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </>
  );
};
