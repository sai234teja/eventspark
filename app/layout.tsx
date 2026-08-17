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
  openGraph: {
    title: 'EventSpark',
    description: 'Real‑time event management platform',
    url: 'https://eventspark-flame.vercel.app',
    siteName: 'EventSpark',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'EventSpark',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EventSpark',
    description: 'Real‑time event management platform',
    creator: '@eventspark',
    images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80'],
  },
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
