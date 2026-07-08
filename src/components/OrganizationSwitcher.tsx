"use client";

import React from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Building2, ChevronDown, PlusCircle } from 'lucide-react';

export function OrganizationSwitcher() {
  const { activeOrganization, organizations, switchOrganization, isLoading } = useTenant();
  const router = useRouter();

  if (isLoading) {
    return (
      <Button variant="outline" className="w-[200px] justify-between" disabled>
        Loading...
      </Button>
    );
  }

  if (!activeOrganization) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between">
          <span className="flex items-center truncate">
            <Building2 className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">{activeOrganization.name}</span>
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => switchOrganization(org.id)}
            className={activeOrganization.id === org.id ? 'bg-accent' : ''}
          >
            {org.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/onboarding')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
