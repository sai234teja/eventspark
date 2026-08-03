'use client';

import { CalendarEvent, downloadICS, getGoogleCalendarUrl, getOutlookCalendarUrl } from '@/utils/calendar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Calendar, Download } from 'lucide-react';

interface CalendarDropdownProps {
  event: CalendarEvent;
  variant?: "default" | "outline" | "ghost" | "secondary";
  className?: string;
}

export function CalendarDropdown({ event, variant = "outline", className }: CalendarDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} className={className}>
          <Calendar className="h-4 w-4 mr-2" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 text-slate-200">
        <DropdownMenuItem 
          onClick={() => window.open(getGoogleCalendarUrl(event), '_blank')}
          className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800"
        >
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => window.open(getOutlookCalendarUrl(event), '_blank')}
          className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800"
        >
          Outlook Calendar
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => downloadICS(event)}
          className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800"
        >
          <Download className="h-4 w-4 mr-2" />
          Apple Calendar (ICS)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
