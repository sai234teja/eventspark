"use client";

import React from 'react';
import { usePermission } from '@/hooks/useRBAC';
import { Permission } from '@/types/rbac';

interface RoleGuardProps {
  require: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ require, children, fallback = null }) => {
  const { can } = usePermission();

  if (can(require)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
