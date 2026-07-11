import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";

export function EventCard({ event, onClick }: { event: any, onClick?: () => void }) {
  const CardContentWrap = (
    <Card className="h-full overflow-hidden border transition-all hover:shadow-lg">
      <div className="aspect-video w-full overflow-hidden bg-muted relative">
        <img 
          src={event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"} 
          alt={event.title} 
          className="h-full w-full object-cover transition-transform hover:scale-105"
          loading="lazy"
        />
        {event.isCompleted && (
           <div className="absolute top-2 right-2">
              <Badge variant="destructive">Completed</Badge>
           </div>
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-start">
           <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
             {event.category || 'General'}
           </Badge>
           <span className="font-bold text-lg text-green-600">
             {event.price === '0' || event.price === 'Free' ? 'Free' : `₹${event.price}`}
           </span>
        </div>
        <h3 className="font-bold text-lg leading-tight line-clamp-2">{event.title}</h3>
        
        <div className="space-y-1 mt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{event.attendees || 0} / {event.maxCapacity || 0} registered</span>
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
    <Link href={`/events/${event.id}`} className="block">
      {CardContentWrap}
    </Link>
  );
}
