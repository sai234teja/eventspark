import { supabase } from '@/contexts/AuthContext';
import { Permission, hasPermission, Role } from '@/types/rbac';

export interface Subscription {
  plan: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface Usage {
  team_members_count: number;
  team_members_limit: number | null; // null means unlimited
  events_count: number;
  events_limit: number | null;
}

export interface Invoice {
  id: string;
  amount: number;
  status: string;
  date: string;
  pdf_url: string;
}

export const getSubscription = async (organizationId: string, currentRole: Role | string): Promise<Subscription> => {
  if (!hasPermission(currentRole, Permission.MANAGE_BILLING)) {
    throw new Error('You do not have permission to view billing information');
  }

  // Future Stripe Integration point
  const { data, error } = await supabase
    .from('organizations')
    .select('subscription_plan')
    .eq('id', organizationId)
    .single();

  if (error) throw error;

  return {
    plan: data.subscription_plan || 'Free',
    status: 'active',
    current_period_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // Mock date
    cancel_at_period_end: false
  };
};

export const getUsage = async (organizationId: string, currentRole: Role | string): Promise<Usage> => {
  if (!hasPermission(currentRole, Permission.MANAGE_BILLING)) {
    throw new Error('You do not have permission to view usage metrics');
  }

  const [membersResult, eventsResult] = await Promise.all([
    supabase.from('organization_members').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId)
  ]);

  // Limits based on plan can be dynamic later
  return {
    team_members_count: membersResult.count || 0,
    team_members_limit: 10, // Example limit for Free/Pro
    events_count: eventsResult.count || 0,
    events_limit: null // Unlimited
  };
};

export const getInvoices = async (organizationId: string, currentRole: Role | string): Promise<Invoice[]> => {
  if (!hasPermission(currentRole, Permission.MANAGE_BILLING)) {
    throw new Error('You do not have permission to view invoices');
  }

  // Placeholder for Stripe invoices
  return [];
};

export const changePlan = async (organizationId: string, newPlan: string, currentRole: Role | string): Promise<void> => {
  if (!hasPermission(currentRole, Permission.MANAGE_BILLING)) {
    throw new Error('You do not have permission to change subscription plans');
  }

  // Placeholder for Stripe Checkout integration
  throw new Error('Stripe integration pending: Cannot change plans at this time.');
};
