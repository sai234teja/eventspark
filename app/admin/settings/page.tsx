"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { updateOrganization } from "@/services/organizationService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRequirePermission } from "@/hooks/useRBAC";
import { Permission } from "@/types/rbac";

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
      await refreshOrganizations(); // Refresh context
      toast({ title: "Settings Saved", description: "Your organization settings have been updated." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save settings", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Organization Settings</h1>
        <p className="text-slate-400 mt-2">Manage your organization's core details and preferences.</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">General Information</CardTitle>
          <CardDescription className="text-slate-400">Update your organization's basic profile details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">Organization Name</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="bg-slate-950 border-slate-800 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-slate-300">URL Slug</Label>
            <Input 
              id="slug" 
              value={formData.slug} 
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
              className="bg-slate-950 border-slate-800 text-white"
            />
            <p className="text-xs text-slate-500">eventspark.com/{formData.slug}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="website" className="text-slate-300">Website URL</Label>
            <Input 
              id="website" 
              type="url"
              value={formData.website} 
              onChange={e => setFormData({ ...formData, website: e.target.value })}
              className="bg-slate-950 border-slate-800 text-white"
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
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SettingsPage;
