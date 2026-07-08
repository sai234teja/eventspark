"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { createOrganization } from '@/services/organizationService';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const { user } = useAuth();
  const { refreshOrganizations } = useTenant();
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;

    setLoading(true);
    try {
      await createOrganization(name, user.id);
      toast.success('Organization created successfully!');
      // Refresh context to load the new organization
      await refreshOrganizations();
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to EventSpark!</CardTitle>
          <CardDescription>To get started, create an organization or wait for an invitation.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="orgName" className="text-sm font-medium">Organization Name</label>
              <Input
                id="orgName"
                placeholder="Acme Events Inc."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !name.trim()}>
              {loading ? 'Creating...' : 'Create Organization'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
