import { EventCard } from '@/components/ui/EventCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { useRef } from 'react';

interface EventCarouselProps {
  title: string;
  icon?: React.ReactNode;
  events: any[];
  isLoading: boolean;
  emptyMessage?: string;
}

export function EventCarousel({ 
  title, 
  icon = <Sparkles className="h-5 w-5 text-indigo-500" />,
  events, 
  isLoading,
  emptyMessage = "No events found right now."
}: EventCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 my-8">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">{icon} {title}</h2>
        <div className="flex gap-4 overflow-hidden">
          {[1,2,3,4].map(i => <div key={i} className="min-w-[300px] h-80 bg-slate-800 rounded-xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="space-y-4 my-8">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">{icon} {title}</h2>
        <Card className="bg-slate-900 border-slate-800 border-dashed">
          <CardContent className="flex items-center justify-center py-12 text-slate-500">
            {emptyMessage}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 my-8 relative group">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">{icon} {title}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 bg-slate-900 border-slate-700" onClick={() => scroll('left')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 bg-slate-900 border-slate-700" onClick={() => scroll('right')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div 
        ref={scrollRef} 
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {events.map((event) => (
          <div key={event.id} className="min-w-[300px] max-w-[300px] snap-start">
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </div>
  );
}
