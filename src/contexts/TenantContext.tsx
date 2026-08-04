"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { OrganizationWithRole, getUserOrganizations } from '@/services/organizationService';
import { useRouter, usePathname } from 'next/navigation';

interface TenantContextType {
  activeOrganization: OrganizationWithRole | null;
  organizations: OrganizationWithRole[];
  currentRole: string | null;
  isLoading: boolean;
  switchOrganization: (orgId: string) => void;
  refreshOrganizations: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [organizations, setOrganizations] = useState<OrganizationWithRole[]>([]);
  const [activeOrganization, setActiveOrganization] = useState<OrganizationWithRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrganizations = async () => {
    if (!user) {
      setOrganizations([]);
      setActiveOrganization(null);
      setIsLoading(false);
      return;
    }

    try {
      const orgs = await getUserOrganizations(user.id);
      setOrganizations(orgs);

      if (orgs.length === 0) {
        setActiveOrganization(null);
        if (pathname === '/onboarding' || pathname === '/dashboard' || pathname === '/organizer' || pathname === '/admin') {
          // If we hit onboarding, enforce the correct role dashboard
          if (pathname === '/onboarding') {
            if (role === 'admin') router.push('/admin');
            else if (role === 'organizer') router.push('/organizer');
            else router.push('/dashboard');
          }
        }
      } else {
        // Try to load from localStorage first
        const savedOrgId = typeof window !== 'undefined' ? localStorage.getItem('activeOrganizationId') : null;
        let selectedOrg = orgs.find(o => o.id === savedOrgId);

        if (!selectedOrg) {
          // If no saved org or saved org not in list, pick the first one
          selectedOrg = orgs[0];
          if (typeof window !== 'undefined') { localStorage.setItem('activeOrganizationId', selectedOrg.id); }
        }

        setActiveOrganization(selectedOrg);
        
        if (pathname === '/onboarding') {
          if (role === 'admin') router.push('/admin');
          else if (role === 'organizer') router.push('/organizer');
          else router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchOrganizations();
    }
  }, [user, authLoading]);

  const switchOrganization = (orgId: string) => {
    const targetOrg = organizations.find(o => o.id === orgId);
    if (targetOrg) {
      setActiveOrganization(targetOrg);
      if (typeof window !== 'undefined') { localStorage.setItem('activeOrganizationId', targetOrg.id); }
      // Optional: Refresh the page or data
      if (typeof window !== 'undefined') { window.location.reload(); }
    }
  };

  const refreshOrganizations = async () => {
    setIsLoading(true);
    await fetchOrganizations();
  };

  const value = {
    activeOrganization,
    organizations,
    currentRole: activeOrganization?.role || null,
    isLoading: isLoading || authLoading,
    switchOrganization,
    refreshOrganizations
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};
