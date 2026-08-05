import '../src/index.css';
import type { Metadata } from 'next';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { TenantProvider } from '@/contexts/TenantContext';
import { ReactQueryProvider } from "@/lib/react-query/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AIChatWidget } from "@/components/shared/AIChatWidget";

export const metadata: Metadata = {
  title: 'EventSpark',
  description: 'Real‑time event management platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased">
        <ReactQueryProvider>
          <AuthProvider>
            <TenantProvider>
              <TooltipProvider>
                <ThemeProvider>
                  <Toaster />
                  <Sonner />
                  {children}
                  <AIChatWidget />
                </ThemeProvider>
              </TooltipProvider>
            </TenantProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
