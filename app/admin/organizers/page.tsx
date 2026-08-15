'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/lib/env';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export default function AdminOrganizersPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const supabase = createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('organizer_applications')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .order('submitted_at', { ascending: false });

    if (!error && data) {
      setApplications(data);
    }
    setLoading(false);
  };

  const handleAction = async (applicationId: string, action: 'approve' | 'reject') => {
    setActionLoading(applicationId);
    try {
      const res = await fetch('/api/admin/organizers/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, action }),
      });

      if (!res.ok) {
        throw new Error('Failed to update application');
      }

      await fetchApplications();
    } catch (err) {
      console.error(err);
      alert('Action failed. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#6C47FF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Organizer Applications</h1>
        <p className="text-slate-400 mt-1">Review and manage pending organizer applications.</p>
      </div>

      <div className="bg-[#111118] rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1A1A24] border-b border-slate-800 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Applicant</th>
                <th className="px-6 py-4 font-medium">Organization</th>
                <th className="px-6 py-4 font-medium">Submitted</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No applications found.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{app.profiles?.full_name || 'Unknown'}</div>
                      <div className="text-xs text-slate-400">{app.profiles?.email}</div>
                      <div className="text-xs text-slate-500 mt-1">{app.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{app.organization_name}</div>
                      <div className="text-xs text-slate-400 capitalize">{app.organization_type}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {formatDistanceToNow(new Date(app.submitted_at), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="secondary"
                        color={
                          app.status === 'APPROVED'
                            ? 'emerald'
                            : app.status === 'REJECTED'
                            ? 'rose'
                            : 'amber'
                        }
                      >
                        {app.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {app.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(app.id, 'approve')}
                            disabled={actionLoading === app.id}
                            className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            {actionLoading === app.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => handleAction(app.id, 'reject')}
                            disabled={actionLoading === app.id}
                            className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3" />
                          Reviewed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
