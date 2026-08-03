'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCertificates } from '@/hooks/useCertificates';
import { Loader2, FileText, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CertificatesPage() {
  const { certificates, isLoading } = useCertificates();

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
        <h1 className="text-2xl font-bold text-white mb-2">My Certificates</h1>
        <p className="text-slate-400">View and download your official event certificates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(!certificates || certificates.length === 0) ? (
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl col-span-full">
            <CardContent className="py-12 text-center text-slate-500">
              <FileText className="w-8 h-8 mx-auto mb-3 text-slate-600" />
              <p>No certificates available yet.</p>
            </CardContent>
          </Card>
        ) : (
          certificates.map((cert) => (
            <Card key={cert.id} className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
              <CardHeader className="border-b border-slate-800/50 pb-4 mb-4">
                <CardTitle className="text-white">{cert.certificate_name}</CardTitle>
                <CardDescription className="text-indigo-400">{cert.issuing_organization}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Issued On</span>
                  <span className="text-white">{cert.issue_date ? new Date(cert.issue_date).toLocaleDateString() : 'N/A'}</span>
                </div>
                {cert.credential_id && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Credential ID</span>
                    <span className="text-slate-300 font-mono text-xs">{cert.credential_id}</span>
                  </div>
                )}
                
                <div className="flex gap-3 pt-4 border-t border-slate-800/50">
                  <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:text-white">
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:text-white">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
