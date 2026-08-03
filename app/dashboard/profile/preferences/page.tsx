'use client';

import { usePreferences } from '@/hooks/usePreferences';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Bell, Shield, Moon, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PreferencesPage() {
  const { preferences, isLoading, updatePreferences, isUpdating } = usePreferences();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await updatePreferences(formData);
      toast({
        title: "Preferences updated",
        description: "Your settings have been successfully saved.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while saving your preferences.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Account Preferences</h1>
        <p className="text-slate-400">Manage your notifications, privacy, and display settings.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Notifications */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center gap-3">
            <Bell className="w-6 h-6 text-indigo-400" />
            <div>
              <CardTitle className="text-white text-lg">Notifications</CardTitle>
              <CardDescription className="text-slate-400">Choose how you want to be notified.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email_notifications" className="text-slate-200 text-base">Email Notifications</Label>
                <p className="text-sm text-slate-400">Receive emails about your account activity and tickets.</p>
              </div>
              <Switch id="email_notifications" name="email_notifications" defaultChecked={preferences?.email_notifications} />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms_notifications" className="text-slate-200 text-base">SMS Notifications</Label>
                <p className="text-sm text-slate-400">Receive text messages for important alerts.</p>
              </div>
              <Switch id="sms_notifications" name="sms_notifications" defaultChecked={preferences?.sms_notifications} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing_emails" className="text-slate-200 text-base">Marketing Emails</Label>
                <p className="text-sm text-slate-400">Receive news, updates, and special offers.</p>
              </div>
              <Switch id="marketing_emails" name="marketing_emails" defaultChecked={preferences?.marketing_emails} />
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center gap-3">
            <Shield className="w-6 h-6 text-indigo-400" />
            <div>
              <CardTitle className="text-white text-lg">Privacy Settings</CardTitle>
              <CardDescription className="text-slate-400">Control who can see your information.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="public_profile" className="text-slate-200 text-base">Public Profile</Label>
                <p className="text-sm text-slate-400">Allow others to view your profile and timeline.</p>
              </div>
              <Switch id="public_profile" name="public_profile" defaultChecked={preferences?.public_profile} />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hide_email" className="text-slate-200 text-base">Hide Email Address</Label>
                <p className="text-sm text-slate-400">Keep your email address private on your profile.</p>
              </div>
              <Switch id="hide_email" name="hide_email" defaultChecked={preferences?.hide_email} />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hide_phone" className="text-slate-200 text-base">Hide Phone Number</Label>
                <p className="text-sm text-slate-400">Keep your phone number private on your profile.</p>
              </div>
              <Switch id="hide_phone" name="hide_phone" defaultChecked={preferences?.hide_phone} />
            </div>
          </CardContent>
        </Card>
        
        {/* Appearance */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center gap-3">
            <Moon className="w-6 h-6 text-indigo-400" />
            <div>
              <CardTitle className="text-white text-lg">Appearance</CardTitle>
              <CardDescription className="text-slate-400">Customize how EventSpark looks for you.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-300">Theme</Label>
                <Select name="theme" defaultValue={preferences?.theme || 'system'}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System Default</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isUpdating} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
