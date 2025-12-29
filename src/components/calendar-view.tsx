"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  type: "phase-start" | "phase-end" | "deadline" | "milestone";
  group?: string;
};

const MONTHS = [
  "Januari", "Februari", "Mars", "April", "Maj", "Juni",
  "Juli", "Augusti", "September", "Oktober", "November", "December"
];

const WEEKDAYS = ["Mån", "Tis", "Ons", "Tors", "Fre", "Lör", "Sön"];

export function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/calendar");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch {
      console.error("Failed to fetch calendar events");
    }
    setLoading(false);
  };

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const daysInMonth = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startPadding = (firstDay.getDay() + 6) % 7; // Monday = 0
    
    type DayItem = { date: Date; isCurrentMonth: boolean };
    const days: DayItem[] = [];
    
    // Föregående månads dagar
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth, -i);
      days.push({ date, isCurrentMonth: false });
    }
    
    // Aktuell månad
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(currentYear, currentMonth, i), isCurrentMonth: true });
    }
    
    // Nästa månads dagar för att fylla ut
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(currentYear, currentMonth + 1, i), isCurrentMonth: false });
    }
    
    return days;
  }, [currentMonth, currentYear]);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "phase-start":
        return "bg-green-500";
      case "phase-end":
        return "bg-blue-500";
      case "deadline":
        return "bg-red-500";
      case "milestone":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Kommande events (nästa 30 dagar)
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= thirtyDaysFromNow;
    }).slice(0, 5);
  }, [events]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Laddar kalender...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Kalender */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {MONTHS[currentMonth]} {currentYear}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Idag
            </Button>
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Veckodagar */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Dagar */}
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map(({ date, isCurrentMonth }, index) => {
              const dayEvents = getEventsForDate(date);
              return (
                <div
                  key={index}
                  className={`min-h-[80px] p-1 border rounded-md ${
                    isCurrentMonth ? "bg-background" : "bg-muted/30"
                  } ${isToday(date) ? "ring-2 ring-primary" : ""}`}
                >
                  <div className={`text-sm font-medium ${
                    isCurrentMonth ? "" : "text-muted-foreground"
                  }`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1 mt-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs px-1 py-0.5 rounded truncate text-white ${getEventColor(event.type)}`}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 2} till
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Kommande events */}
      <Card>
        <CardHeader>
          <CardTitle>Kommande händelser</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Inga kommande händelser
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${getEventColor(event.type)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString("sv-SE", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                      {event.group && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {event.group}
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Teckenförklaring */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">Teckenförklaring</p>
            <div className="space-y-1">
              {[
                { type: "phase-start", label: "Fas börjar" },
                { type: "phase-end", label: "Fas slutar" },
                { type: "deadline", label: "Deadline" },
                { type: "milestone", label: "Milestone" },
              ].map((item) => (
                <div key={item.type} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getEventColor(item.type)}`} />
                  <span className="text-xs">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
