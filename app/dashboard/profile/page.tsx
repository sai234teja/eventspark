'use client';

import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin, Globe, Mail, Phone, Calendar } from 'lucide-react';

export default function ProfileOverview() {
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12 text-slate-400">
        Profile data not available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cover Photo */}
      <div className="h-48 rounded-xl bg-slate-800 overflow-hidden relative">
        {profile.cover_photo_url ? (
          <img src={profile.cover_photo_url} alt="Cover" className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-indigo-900/50 to-purple-900/50" />
        )}
      </div>

      {/* Avatar & Basic Info */}
      <div className="px-6 relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-5">
        <div className="w-32 h-32 rounded-full border-4 border-slate-900 bg-slate-800 overflow-hidden z-10 flex-shrink-0">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name || 'Avatar'} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-indigo-900/50 text-indigo-300 text-3xl font-bold">
              {profile.full_name?.charAt(0) || 'U'}
            </div>
          )}
        </div>
        <div className="flex-1 text-center sm:text-left pb-2">
          <h1 className="text-2xl font-bold text-white">{profile.full_name || 'User'}</h1>
          {profile.headline && <p className="text-indigo-300 font-medium">{profile.headline}</p>}
          <p className="text-slate-400 text-sm mt-1">{profile.username ? `@${profile.username}` : ''}</p>
        </div>
      </div>

      <div className="px-6 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Left Column: About & Contact */}
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg">Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.location && (
                <div className="flex items-center text-sm text-slate-300">
                  <MapPin className="w-4 h-4 mr-3 text-slate-500" />
                  {profile.location}
                </div>
              )}
              {profile.website && (
                <div className="flex items-center text-sm text-slate-300">
                  <Globe className="w-4 h-4 mr-3 text-slate-500" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center text-sm text-slate-300">
                  <Phone className="w-4 h-4 mr-3 text-slate-500" />
                  {profile.phone}
                </div>
              )}
              {profile.created_at && (
                <div className="flex items-center text-sm text-slate-300">
                  <Calendar className="w-4 h-4 mr-3 text-slate-500" />
                  Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Bio & More */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white text-lg">About</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.bio ? (
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
              ) : (
                <p className="text-slate-500 italic">No bio provided yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
