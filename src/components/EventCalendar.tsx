import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg } from '@fullcalendar/core';
import type { Database } from '../types/supabase';

type Event = Database['public']['Tables']['events']['Row'];

interface EventCalendarProps {
  events: Event[];
  onEventClick: (event: Event) => void;
}

export function EventCalendar({ events, onEventClick }: EventCalendarProps) {
  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start_time,
    end: event.end_time,
    extendedProps: event,
  }));

  const handleEventClick = (clickInfo: EventClickArg) => {
    onEventClick(clickInfo.event.extendedProps as Event);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={calendarEvents}
        eventClick={handleEventClick}
        height="auto"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: 'short',
        }}
        eventClassNames="cursor-pointer"
      />
    </div>
  );
}