"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { useOrganizationSettings, useUpdateOrganization, useUpdateOrganizationSettings } from "@/lib/react-query/hooks/useOrganizations";
import { uploadBrandAsset } from "@/services/organizationService";
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
import { BrandPreview } from "@/components/ui/BrandPreview";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SettingsPage = () => {
  const { activeOrganization, currentRole, refreshOrganizations } = useTenant();
  const { isAuthorized } = useRequirePermission(Permission.MANAGE_SETTINGS);
  const { toast } = useToast();
  
  const { data: settings, isLoading: isLoadingSettings } = useOrganizationSettings(activeOrganization?.id);
  const updateOrgMutation = useUpdateOrganization(activeOrganization?.id || "", currentRole || "");
  const updateSettingsMutation = useUpdateOrganizationSettings(activeOrganization?.id || "", currentRole || "");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    website: "",
    timezone: "",
    primary_color: "",
    secondary_color: "",
    accent_color: "",
    font_family: "Inter",
    border_radius: "0.5rem",
    theme_preference: "system"
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [contrastWarning, setContrastWarning] = useState<string | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Calculate contrast ratio between two hex colors
  const getLuminance = (hex: string) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const checkContrast = (color1: string, color2: string) => {
    try {
      if (!color1 || !color2 || color1.length !== 7 || color2.length !== 7) return 4.5;
      const l1 = getLuminance(color1);
      const l2 = getLuminance(color2);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      return ratio;
    } catch (e) {
      return 4.5; // fallback
    }
  };

  useEffect(() => {
    if (formData.primary_color) {
      // Assuming white text on primary color for primary buttons
      const ratio = checkContrast(formData.primary_color, "#ffffff");
      if (ratio < 4.5) {
        setContrastWarning("Primary color has low contrast with white text. This may reduce readability on buttons.");
      } else {
        setContrastWarning(null);
      }
    }
  }, [formData.primary_color]);

  useEffect(() => {
    if (activeOrganization && settings) {
      setFormData({
        name: activeOrganization.name || "",
        slug: activeOrganization.slug || "",
        website: settings.website || "",
        timezone: settings.timezone || "",
        primary_color: settings.primary_color || "#000000",
        secondary_color: settings.secondary_color || "#475569",
        accent_color: settings.accent_color || "#8b5cf6",
        font_family: settings.font_family || "Inter",
        border_radius: settings.border_radius || "0.5rem",
        theme_preference: settings.theme_preference || "system"
      });
      setLogoPreview(settings.logo_url || "");
    }
  }, [activeOrganization, settings]);

  if (!isAuthorized) return null;

  const handleSave = async () => {
    if (!activeOrganization || !currentRole) return;
    
    try {
      // Handle file uploads first
      let uploadedLogoUrl = settings?.logo_url || "";
      let uploadedFaviconUrl = settings?.favicon_url || "";

      if (logoFile) {
        uploadedLogoUrl = await uploadBrandAsset(activeOrganization.id, logoFile, 'logo', currentRole);
      }
      if (faviconFile) {
        uploadedFaviconUrl = await uploadBrandAsset(activeOrganization.id, faviconFile, 'favicon', currentRole);
      }

      // Update basic org info
      await updateOrgMutation.mutateAsync({ name: formData.name, slug: formData.slug });
      // Update settings
      await updateSettingsMutation.mutateAsync({ 
        website: formData.website, 
        timezone: formData.timezone,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        accent_color: formData.accent_color,
        font_family: formData.font_family,
        border_radius: formData.border_radius,
        theme_preference: formData.theme_preference,
        logo_url: uploadedLogoUrl,
        favicon_url: uploadedFaviconUrl
      });
      
      await refreshOrganizations();
      toast({ title: "Settings Saved", description: "Your organization settings have been updated." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save settings", variant: "destructive" });
    }
  };

  const isSaving = updateOrgMutation.isPending || updateSettingsMutation.isPending;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "Error", description: "Logo must be under 2MB", variant: "destructive" });
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 512 * 1024) {
        toast({ title: "Error", description: "Favicon must be under 512KB", variant: "destructive" });
        return;
      }
      setFaviconFile(file);
    }
  };

  const handleDeleteOrganization = async () => {
    toast({ title: "Coming soon", description: "Organization deletion will be available in a future update.", variant: "destructive" });
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      <SectionHeader 
        title="Organization Settings" 
        description="Manage your organization's details, preferences, and branding."
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="general" className="data-[state=active]:bg-slate-800">General</TabsTrigger>
          <TabsTrigger value="branding" className="data-[state=active]:bg-slate-800">Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-12">
          {/* General Settings Section */}
          <section>
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
        </TabsContent>

        <TabsContent value="branding" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              {/* Assets */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Assets</CardTitle>
                  <CardDescription>Upload your organization logo and favicon.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Logo (Max 2MB)</Label>
                    <div className="flex items-center space-x-4">
                      {logoPreview ? (
                        <div className="h-16 w-16 bg-white rounded flex items-center justify-center overflow-hidden shrink-0">
                          <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain" />
                        </div>
                      ) : (
                        <div className="h-16 w-16 bg-slate-800 rounded flex items-center justify-center shrink-0">
                          <span className="text-slate-500 text-xs">No Logo</span>
                        </div>
                      )}
                      <Input type="file" accept="image/png, image/jpeg, image/svg+xml, image/webp" onChange={handleLogoChange} className="bg-slate-950 border-slate-800 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Favicon (Max 512KB)</Label>
                    <Input type="file" accept="image/png, image/x-icon, image/svg+xml" onChange={handleFaviconChange} className="bg-slate-950 border-slate-800 text-white" />
                  </div>
                </CardContent>
              </Card>

              {/* Colors */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Colors</CardTitle>
                  <CardDescription>Customize your brand colors.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary_color" className="text-slate-300">Primary Color</Label>
                      <div className="flex space-x-2">
                        <Input type="color" id="primary_color" value={formData.primary_color} onChange={(e) => setFormData({...formData, primary_color: e.target.value})} className="h-10 w-14 p-1 bg-slate-950 border-slate-800 cursor-pointer" />
                        <Input value={formData.primary_color} onChange={(e) => setFormData({...formData, primary_color: e.target.value})} className="bg-slate-950 border-slate-800 text-white font-mono uppercase" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondary_color" className="text-slate-300">Secondary Color</Label>
                      <div className="flex space-x-2">
                        <Input type="color" id="secondary_color" value={formData.secondary_color} onChange={(e) => setFormData({...formData, secondary_color: e.target.value})} className="h-10 w-14 p-1 bg-slate-950 border-slate-800 cursor-pointer" />
                        <Input value={formData.secondary_color} onChange={(e) => setFormData({...formData, secondary_color: e.target.value})} className="bg-slate-950 border-slate-800 text-white font-mono uppercase" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 max-w-[50%]">
                    <Label htmlFor="accent_color" className="text-slate-300">Accent Color</Label>
                    <div className="flex space-x-2">
                      <Input type="color" id="accent_color" value={formData.accent_color} onChange={(e) => setFormData({...formData, accent_color: e.target.value})} className="h-10 w-14 p-1 bg-slate-950 border-slate-800 cursor-pointer" />
                      <Input value={formData.accent_color} onChange={(e) => setFormData({...formData, accent_color: e.target.value})} className="bg-slate-950 border-slate-800 text-white font-mono uppercase" />
                    </div>
                  </div>
                  {contrastWarning && (
                    <div className="bg-orange-950/30 border border-orange-900/50 p-3 rounded-md flex items-start space-x-2 mt-4">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-orange-200">{contrastWarning}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Typography & Layout */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Typography & Layout</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Font Family</Label>
                    <Select value={formData.font_family} onValueChange={(val) => setFormData({...formData, font_family: val})}>
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="Inter">Inter (Default)</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Outfit">Outfit</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Border Radius</Label>
                    <Select value={formData.border_radius} onValueChange={(val) => setFormData({...formData, border_radius: val})}>
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                        <SelectValue placeholder="Select radius" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="0rem">Sharp (0px)</SelectItem>
                        <SelectItem value="0.3rem">Slight (~5px)</SelectItem>
                        <SelectItem value="0.5rem">Medium (8px)</SelectItem>
                        <SelectItem value="0.75rem">Large (12px)</SelectItem>
                        <SelectItem value="1rem">Full (16px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Theme Preference</Label>
                    <Select value={formData.theme_preference} onValueChange={(val) => setFormData({...formData, theme_preference: val})}>
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="system">System Default</SelectItem>
                        <SelectItem value="light">Always Light</SelectItem>
                        <SelectItem value="dark">Always Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t border-slate-800 pt-4">
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 text-white" 
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Branding
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Live Preview */}
            <div className="lg:sticky lg:top-6 space-y-4 h-fit">
              <h3 className="text-lg font-medium text-white">Live Preview</h3>
              <p className="text-sm text-slate-400">See how your organization will look to participants.</p>
              <BrandPreview 
                primaryColor={formData.primary_color}
                secondaryColor={formData.secondary_color}
                accentColor={formData.accent_color}
                fontFamily={formData.font_family}
                borderRadius={formData.border_radius}
                themePreference={formData.theme_preference}
                logoUrl={logoPreview}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

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
