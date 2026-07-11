import '../src/index.css';
import type { Metadata } from 'next';
import Providers from './providers';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { TenantProvider } from '@/contexts/TenantContext';
import { ReactQueryProvider } from "@/lib/react-query/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: 'EventSpark',
  description: 'Real‑time event management platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <Providers>
          <ReactQueryProvider>
            <AuthProvider>
              <TenantProvider>
                <TooltipProvider>
                  <ThemeProvider>
                    <Toaster />
                    <Sonner />
                    {children}
                  </ThemeProvider>
                </TooltipProvider>
              </TenantProvider>
            </AuthProvider>
          </ReactQueryProvider>
        </Providers>
      </body>
    </html>
  );
}
