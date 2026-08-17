import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight } from "lucide-react";

// Mock blog data since we don't have a CMS or DB table for this yet
const blogPosts = [
  {
    id: "1",
    title: "10 Proven Strategies to Increase Event Attendance",
    excerpt: "Discover the marketing secrets that top organizers use to sell out their events weeks in advance.",
    date: "2026-07-15",
    author: "EventSpark Team",
    category: "Marketing",
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"
  },
  {
    id: "2",
    title: "How to Build a Seamless Onsite Check-in Experience",
    excerpt: "Long lines kill event momentum. Learn how to use QR badges and fast lanes to get attendees inside quickly.",
    date: "2026-07-10",
    author: "Sarah Johnson",
    category: "Operations",
    readTime: "7 min read",
    imageUrl: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800&q=80"
  },
  {
    id: "3",
    title: "Understanding Event ROI: A Guide for Organizers",
    excerpt: "Stop guessing your event's success. Here is how to measure real return on investment using data analytics.",
    date: "2026-07-05",
    author: "Michael Chen",
    category: "Analytics",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
  }
];

export default function BlogPage() {
  return (
    <div className="container mx-auto py-12 space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">The EventSpark Blog</h1>
        <p className="text-xl text-muted-foreground">
          Insights, strategies, and industry news for modern event organizers.
        </p>
      </div>

      <div className="flex justify-center gap-2 flex-wrap">
        <Button variant="secondary" className="rounded-full">All Articles</Button>
        <Button variant="ghost" className="rounded-full">Marketing</Button>
        <Button variant="ghost" className="rounded-full">Operations</Button>
        <Button variant="ghost" className="rounded-full">Analytics</Button>
        <Button variant="ghost" className="rounded-full">Product Updates</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <article key={post.id} className="group flex flex-col space-y-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50">
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted relative">
              {/* Using standard img tag for simplicity, ideally next/image */}
              <Image 
                src={post.imageUrl} 
                alt={post.title} 
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            
            <div className="flex flex-col flex-1 space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground">
                  {post.category}
                </span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
              
              <h2 className="text-xl font-bold leading-tight group-hover:underline">
                <Link href={`/blog/${post.id}`}>{post.title}</Link>
              </h2>
              
              <p className="text-muted-foreground line-clamp-3 flex-1 text-sm">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t mt-auto">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      
      <div className="flex justify-center pt-8">
        <Button variant="outline" size="lg">
          Load More Articles
        </Button>
      </div>
    </div>
  );
}
