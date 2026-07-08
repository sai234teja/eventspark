import '../src/index.css';
import type { Metadata } from 'next';
import Providers from './providers';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { TenantProvider } from '@/contexts/TenantContext';

export const metadata: Metadata = {
  title: 'EventSpark',
  description: 'Real‑time event management platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <Providers>
          <AuthProvider>
            <TenantProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                {children}
              </TooltipProvider>
            </TenantProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
