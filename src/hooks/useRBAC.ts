"use client";

import { useTenant } from '@/contexts/TenantContext';
import { Permission, Role, hasPermission } from '@/types/rbac';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

export const useCurrentRole = (): Role | null => {
  const { currentRole } = useTenant();
  if (!currentRole) return null;
  return currentRole.toLowerCase() as Role;
};

export const usePermission = () => {
  const role = useCurrentRole();

  const can = (permission: Permission): boolean => {
    return hasPermission(role, permission);
  };

  return { can, role };
};

export const useRequirePermission = (permission: Permission, redirectTo: string = '/dashboard') => {
  const { can, role } = usePermission();
  const { isLoading } = useTenant();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && role) {
      if (!can(permission)) {
        toast.error('You do not have permission to access this page.');
        router.push(redirectTo);
      }
    }
  }, [can, permission, isLoading, role, router, redirectTo]);

  return { isAuthorized: !isLoading && role && can(permission), isLoading };
};
