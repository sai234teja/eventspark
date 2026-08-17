import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";

export function EventCard({ event, onClick, priority = false }: { event: any, onClick?: () => void, priority?: boolean }) {
  const CardContentWrap = (
    <Card className="group h-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[12px] shadow-sm hover:-translate-y-1 hover:shadow-lg cursor-pointer transition-all duration-200 ease-out">
      <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
        <Image 
          src={event.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"} 
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
        />
        {event.status === 'completed' && (
           <div className="absolute top-2 right-2">
              <Badge variant="destructive" className="rounded-[8px]">Completed</Badge>
           </div>
        )}
      </div>
      <CardContent className="p-5 space-y-3">
        <div className="flex justify-between items-center">
           <Badge variant="secondary" className="rounded-[24px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-medium">
             {event.category || 'General'}
           </Badge>
           <span className="font-bold text-base text-emerald-600 dark:text-emerald-400">
             {event.price === 0 || event.price === '0' || event.price === 'Free' || !event.price ? 'Free' : `₹${Number(event.price).toLocaleString('en-IN')}`}
           </span>
        </div>
        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2 min-h-[2.75rem] group-hover:text-indigo-500 transition-colors">{event.title}</h3>
        
        <div className="space-y-1.5 mt-2 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span>{event.start_date ? new Date(event.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">{event.city || event.location}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (onClick) {
    return (
      <div onClick={onClick} className="block cursor-pointer">
        {CardContentWrap}
      </div>
    );
  }

  return (
    <Link href={`/events/${event.slug || event.id}`} className="block">
      {CardContentWrap}
    </Link>
  );
}
