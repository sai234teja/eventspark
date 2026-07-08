"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { getSubscription, getUsage, Subscription, Usage } from "@/services/billingService";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const BillingPage = () => {
  const { activeOrganization, currentRole } = useTenant();
  const { toast } = useToast();
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeOrganization && currentRole) {
      loadBillingData();
    }
  }, [activeOrganization, currentRole]);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const [subData, usageData] = await Promise.all([
        getSubscription(activeOrganization!.id, currentRole!),
        getUsage(activeOrganization!.id, currentRole!)
      ]);
      setSubscription(subData);
      setUsage(usageData);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to load billing details", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = () => {
    toast({ title: "Coming Soon", description: "Stripe integration is pending. Please contact support to change your plan." });
  };

  if (loading || !subscription || !usage) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const teamUsagePercent = usage.team_members_limit ? Math.min(100, (usage.team_members_count / usage.team_members_limit) * 100) : 0;
  const eventsUsagePercent = usage.events_limit ? Math.min(100, (usage.events_count / usage.events_limit) * 100) : 0; // 0 if unlimited

  return (
    <div className="space-y-6 max-w-5xl">
      <SectionHeader 
        title="Billing & Subscription" 
        description="Manage your subscription plan, billing details, and view usage."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Current Plan */}
        <Card className="md:col-span-2 bg-slate-900 border-purple-500/30 border-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs px-3 py-1 font-bold rounded-bl-lg uppercase tracking-wider">
            {subscription.status}
          </div>
          <CardHeader>
            <CardTitle className="text-2xl text-white">{subscription.plan} Plan</CardTitle>
            <CardDescription className="text-slate-400">Everything you need to run professional events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-white">{subscription.plan === 'Pro' ? '$49' : '$0'}</span>
              <span className="text-slate-400">/month</span>
            </div>
            
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <div className="flex items-center text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                Up to {usage.team_members_limit || 'unlimited'} active team members
              </div>
              <div className="flex items-center text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                {usage.events_limit ? `Up to ${usage.events_limit}` : 'Unlimited'} events and registrations
              </div>
              <div className="flex items-center text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                Advanced analytics and reporting
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-950/50 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
            <span className="text-sm text-slate-400">
              Next billing date: {format(new Date(subscription.current_period_end), 'MMM d, yyyy')}
            </span>
            <Button variant="outline" onClick={handleManageBilling} className="border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 w-full sm:w-auto">
              Manage Billing
            </Button>
          </CardFooter>
        </Card>

        {/* Usage Summary */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">Usage</CardTitle>
            <CardDescription className="text-slate-400">This billing cycle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Team Members</span>
                <span className="text-slate-400">{usage.team_members_count} / {usage.team_members_limit || '∞'}</span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className={`h-full ${teamUsagePercent > 90 ? 'bg-red-500' : 'bg-purple-500'}`} style={{ width: `${teamUsagePercent}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Active Events</span>
                <span className="text-slate-400">{usage.events_count} / {usage.events_limit || '∞'}</span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: usage.events_limit ? `${eventsUsagePercent}%` : '100%' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning */}
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-blue-200">Stripe Integration Pending</h4>
          <p className="text-sm text-blue-300/80 mt-1">
            The billing portal is currently in display-only mode. Real subscription management via Stripe will be enabled in a future update.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
