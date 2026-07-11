import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <BrandLogo />
          <nav className="hidden md:flex gap-6">
            <Link href="/events" className="text-sm font-medium hover:text-primary">Discover Events</Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-primary">Pricing</Link>
            <Link href="/blog" className="text-sm font-medium hover:text-primary">Blog</Link>
          </nav>
          <div className="flex gap-4 items-center">
            <Link href="/login" className="text-sm font-medium hover:text-primary hidden sm:block">Log in</Link>
            <Button asChild><Link href="/signup">Get Started</Link></Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t py-8 md:py-12 bg-muted/40 mt-auto">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <BrandLogo />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for modern organizers. © {new Date().getFullYear()} EventSpark.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">Terms</Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
