'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { User, Mail, Shield, Camera, Loader2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    id: '',
    email: '',
    full_name: '',
    role: '',
    avatar_url: ''
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/auth/login');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile({
          id: user.id,
          email: user.email || '',
          full_name: data.full_name || '',
          role: data.role || 'user',
          avatar_url: data.avatar_url || ''
        });
      }
      setLoading(false);
    }

    fetchProfile();
  }, [router, supabase]);

  const handleChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-[#6C47FF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">My Profile</h1>
        <p className="text-slate-400">Manage your personal information and account settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Avatar Sidebar */}
        <div className="md:col-span-1">
          <Card className="bg-[#111118] border-slate-800/60 text-center">
            <CardContent className="pt-6 pb-6 flex flex-col items-center">
              <div className="relative group cursor-pointer mb-4">
                <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-700 overflow-hidden relative">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-500/20 text-indigo-400 text-4xl font-bold">
                      {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white truncate w-full px-4">{profile.full_name || 'User'}</h3>
              <p className="text-sm text-slate-400 truncate w-full px-4">{profile.email}</p>
              
              <div className="mt-6 flex items-center justify-center gap-2 px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-full text-xs font-bold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5" />
                {profile.role}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2">
          <Card className="bg-[#111118] border-slate-800/60">
            <CardHeader>
              <CardTitle className="text-white">Personal Information</CardTitle>
              <CardDescription className="text-slate-400">
                Update your name and other details here.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSave}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-slate-300">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="full_name"
                      value={profile.full_name}
                      onChange={(e) => handleChange('full_name', e.target.value)}
                      className="pl-10 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-[#6C47FF]"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="email"
                      value={profile.email}
                      readOnly
                      disabled
                      className="pl-10 bg-slate-900/80 border-slate-800 text-slate-400 cursor-not-allowed opacity-70"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Email cannot be changed directly.</p>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <Button 
                    type="submit" 
                    className="bg-[#6C47FF] hover:bg-[#5835e5] text-white font-bold"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
