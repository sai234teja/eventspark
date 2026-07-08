"use client";

import React from "react";
import { useTenant } from "@/contexts/TenantContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useRequirePermission } from "@/hooks/useRBAC";
import { Permission } from "@/types/rbac";

const BillingPage = () => {
  const { activeOrganization } = useTenant();
  const { isAuthorized } = useRequirePermission(Permission.MANAGE_BILLING);

  if (!isAuthorized) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Billing & Subscription</h1>
        <p className="text-slate-400 mt-2">Manage your subscription plan, billing details, and view usage.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Current Plan */}
        <Card className="md:col-span-2 bg-slate-900 border-purple-500/30 border-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs px-3 py-1 font-bold rounded-bl-lg">
            ACTIVE PLAN
          </div>
          <CardHeader>
            <CardTitle className="text-2xl text-white">Pro Plan</CardTitle>
            <CardDescription className="text-slate-400">Everything you need to run professional events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-white">$49</span>
              <span className="text-slate-400">/month</span>
            </div>
            
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <div className="flex items-center text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                Up to 10 active team members
              </div>
              <div className="flex items-center text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                Unlimited events and registrations
              </div>
              <div className="flex items-center text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                Advanced analytics and reporting
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-950/50 border-t border-slate-800 flex justify-between">
            <span className="text-sm text-slate-400">Next billing date: Aug 15, 2026</span>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white">
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
                <span className="text-slate-400">3 / 10</span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-[30%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Active Events</span>
                <span className="text-slate-400">2 / ∞</span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[10%]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning */}
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
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
