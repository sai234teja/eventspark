'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useBadges } from '@/hooks/useBadges';
import { Loader2, Award, Shield, Star, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function BadgesPage() {
  const { badges, isLoading } = useBadges();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">My Badges</h1>
        <p className="text-slate-400">View your earned achievements and community status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(!badges || badges.length === 0) ? (
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl col-span-full">
            <CardContent className="py-12 text-center text-slate-500">
              <Award className="w-8 h-8 mx-auto mb-3 text-slate-600" />
              <p>You haven&apos;t earned any badges yet. Attend events to unlock achievements!</p>
            </CardContent>
          </Card>
        ) : (
          badges.map((badge) => (
            <Card key={badge.id} className="bg-slate-900/50 border-indigo-900/50 backdrop-blur-xl hover:border-indigo-500 transition-colors">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
                  {badge.badge_type === 'organizer' ? (
                    <Shield className="w-8 h-8 text-indigo-400" />
                  ) : badge.badge_type === 'achievement' ? (
                    <Star className="w-8 h-8 text-yellow-400" />
                  ) : (
                    <Award className="w-8 h-8 text-emerald-400" />
                  )}
                </div>
                <h3 className="text-white font-semibold text-lg mb-1">{badge.badge_name}</h3>
                <Badge variant="outline" className="text-indigo-400 border-indigo-500/30">
                  {badge.badge_type.toUpperCase()}
                </Badge>
                {badge.issued_at && (
                  <p className="text-xs text-slate-500 mt-4">
                    Issued {new Date(badge.issued_at).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}

        {/* Locked Badges Placeholder */}
        <Card className="bg-slate-900/20 border-slate-800 backdrop-blur-xl opacity-60">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-slate-300 font-semibold text-lg mb-1">Super Attendee</h3>
            <p className="text-sm text-slate-500">Attend 10 events to unlock</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
