import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Ticket, BarChart3, Users } from "lucide-react";

export default function PublicLandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="space-y-6 pb-8 pt-16 md:pb-12 md:pt-24 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center mx-auto">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
            The modern platform for <br className="hidden sm:block" />
            <span className="text-primary">unforgettable events</span>.
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 mx-auto">
            EventSpark provides everything you need to ticket, manage, and scale your events. Designed for modern organizers across India.
          </p>
          <div className="space-x-4 mt-4">
            <Button size="lg" asChild>
              <Link href="/signup">
                Host an Event <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/events">Explore Events</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto space-y-12 py-16 md:py-24 bg-slate-50 dark:bg-transparent">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Everything you need</h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            A comprehensive toolkit to sell tickets, manage attendees, and track your success in real-time.
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-8 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          <div className="relative overflow-hidden rounded-lg border bg-background p-6">
            <Ticket className="h-10 w-10 mb-4 text-primary" />
            <h3 className="font-bold">Smart Ticketing</h3>
            <p className="text-sm text-muted-foreground mt-2">Multi-tier tickets, VIP passes, and instant Razorpay payments with GST support.</p>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-6">
            <BarChart3 className="h-10 w-10 mb-4 text-primary" />
            <h3 className="font-bold">Real-time Analytics</h3>
            <p className="text-sm text-muted-foreground mt-2">Track sales, page views, and conversion rates live on your dashboard.</p>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-6">
            <Users className="h-10 w-10 mb-4 text-primary" />
            <h3 className="font-bold">Attendee Management</h3>
            <p className="text-sm text-muted-foreground mt-2">Seamless QR check-ins, bulk email notifications, and printable badges.</p>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="border-t py-16 md:py-24">
        <div className="container mx-auto flex flex-col items-center text-center gap-6">
          <h2 className="font-heading text-3xl md:text-5xl">Ready to spark your next event?</h2>
          <Button size="lg" asChild>
            <Link href="/signup">Create your first event for free</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
