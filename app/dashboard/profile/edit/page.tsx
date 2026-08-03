'use client';

import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
  const { profile, isLoading, updateBio, isUpdatingBio } = useProfile();
  const { toast } = useToast();
  const router = useRouter();

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
      await updateBio(formData);
      toast({
        title: "Profile updated",
        description: "Your profile details have been successfully updated.",
      });
      router.push('/dashboard/profile');
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating your profile.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
      
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white text-lg">Basic Information</CardTitle>
          <CardDescription className="text-slate-400">
            Update your professional headline, bio, and contact information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="headline" className="text-slate-300">Professional Headline</Label>
              <Input 
                id="headline" 
                name="headline" 
                defaultValue={profile?.headline || ''} 
                placeholder="e.g. Senior Software Engineer at TechCorp"
                className="bg-slate-800/50 border-slate-700 text-white"
                maxLength={100}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-slate-300">Bio</Label>
              <Textarea 
                id="bio" 
                name="bio" 
                defaultValue={profile?.bio || ''} 
                placeholder="Tell us a little bit about yourself..."
                className="bg-slate-800/50 border-slate-700 text-white min-h-[120px]"
                maxLength={500}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-slate-300">Location</Label>
                <Input 
                  id="location" 
                  name="location" 
                  defaultValue={profile?.location || ''} 
                  placeholder="e.g. San Francisco, CA"
                  className="bg-slate-800/50 border-slate-700 text-white"
                  maxLength={100}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website" className="text-slate-300">Website</Label>
                <Input 
                  id="website" 
                  name="website" 
                  type="url"
                  defaultValue={profile?.website || ''} 
                  placeholder="https://yourwebsite.com"
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push('/dashboard/profile')} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdatingBio} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isUpdatingBio ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
