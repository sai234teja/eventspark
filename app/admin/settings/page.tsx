"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { updateOrganization } from "@/services/organizationService";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle } from "lucide-react";
import { useRequirePermission } from "@/hooks/useRBAC";
import { Permission } from "@/types/rbac";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";

const SettingsPage = () => {
  const { activeOrganization, currentRole, refreshOrganizations } = useTenant();
  const { isAuthorized } = useRequirePermission(Permission.MANAGE_SETTINGS);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    website: "",
    timezone: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (activeOrganization) {
      setFormData({
        name: activeOrganization.name || "",
        slug: activeOrganization.slug || "",
        website: (activeOrganization as any).website || "",
        timezone: (activeOrganization as any).timezone || ""
      });
    }
  }, [activeOrganization]);

  if (!isAuthorized) return null;

  const handleSave = async () => {
    if (!activeOrganization || !currentRole) return;
    
    setIsSaving(true);
    try {
      await updateOrganization(activeOrganization.id, formData, currentRole);
      await refreshOrganizations();
      toast({ title: "Settings Saved", description: "Your organization settings have been updated." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save settings", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOrganization = async () => {
    toast({ title: "Coming soon", description: "Organization deletion will be available in a future update.", variant: "destructive" });
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-12 max-w-4xl pb-16">
      
      {/* General Settings Section */}
      <section>
        <SectionHeader 
          title="General Settings" 
          description="Manage your organization's core details."
        />
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Organization Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-950 border-slate-800 text-white max-w-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-slate-300">URL Slug</Label>
              <Input 
                id="slug" 
                value={formData.slug} 
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                className="bg-slate-950 border-slate-800 text-white max-w-md"
              />
              <p className="text-xs text-slate-500">eventspark.com/org/{formData.slug}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="text-slate-300">Website URL</Label>
              <Input 
                id="website" 
                type="url"
                value={formData.website} 
                onChange={e => setFormData({ ...formData, website: e.target.value })}
                className="bg-slate-950 border-slate-800 text-white max-w-md"
                placeholder="https://acme.com"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-slate-800 pt-4">
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save General Settings
            </Button>
          </CardFooter>
        </Card>
      </section>

      {/* Organization Preferences */}
      <section>
        <SectionHeader 
          title="Preferences" 
          description="Configure localization and default behaviors."
        />
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-slate-300">Default Timezone</Label>
              <Input 
                id="timezone" 
                value={formData.timezone} 
                onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                className="bg-slate-950 border-slate-800 text-white max-w-md"
                placeholder="America/New_York"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-slate-800 pt-4">
            <Button 
              variant="outline"
              className="border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white" 
              onClick={handleSave}
              disabled={isSaving}
            >
              Save Preferences
            </Button>
          </CardFooter>
        </Card>
      </section>

      {/* Security (Placeholder) */}
      <section>
        <SectionHeader 
          title="Security" 
          description="Manage SSO and two-factor authentication requirements."
        />
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <p className="text-slate-500 text-sm">Security settings will be available in a future update.</p>
          </CardContent>
        </Card>
      </section>

      {/* Danger Zone */}
      <section>
        <SectionHeader 
          title="Danger Zone" 
          description="Destructive actions that cannot be undone."
        />
        <Card className="bg-red-950/20 border-red-900/50">
          <CardContent className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-red-400 font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Delete Organization
              </h4>
              <p className="text-sm text-red-400/80 mt-1">
                Permanently delete this organization, all events, and all data. This action is not reversible.
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 shrink-0"
            >
              Delete Organization
            </Button>
          </CardContent>
        </Card>
      </section>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteOrganization}
        title="Delete Organization"
        description="Are you absolutely sure? This will permanently delete your organization and all associated data. This action cannot be undone."
        confirmText="Yes, delete organization"
        isDestructive={true}
      />
    </div>
  );
};

export default SettingsPage;
