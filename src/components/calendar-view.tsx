"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  type: "phase-start" | "phase-end" | "deadline" | "milestone";
  group?: string;
};

type ViewMode = "week" | "month";

const MONTHS = [
  "Januari", "Februari", "Mars", "April", "Maj", "Juni",
  "Juli", "Augusti", "September", "Oktober", "November", "December"
];

const WEEKDAYS = ["Mån", "Tis", "Ons", "Tors", "Fre", "Lör", "Sön"];
const WEEKDAYS_FULL = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];

export function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("month");

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

  // Veckoberäkning
  const getWeekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday = 0
    startOfWeek.setDate(startOfWeek.getDate() + diff);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  }, [currentDate]);

  // Veckonummer
  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  // Månadsdagar
  const daysInMonth = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startPadding = (firstDay.getDay() + 6) % 7;
    
    type DayItem = { date: Date; isCurrentMonth: boolean };
    const days: DayItem[] = [];
    
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth, -i);
      days.push({ date, isCurrentMonth: false });
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(currentYear, currentMonth, i), isCurrentMonth: true });
    }
    
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

  // Färger med olika nyanser per grupp
  const getEventColor = (type: string, group?: string) => {
    // Bestäm om det är grupp 1 (Stockholm) eller grupp 2 (Malmö)
    const isGroup2 = group?.toLowerCase().includes("malmö") || group?.toLowerCase().includes("malmo");
    
    switch (type) {
      case "phase-start": 
        return isGroup2 ? "bg-emerald-500" : "bg-green-500";
      case "phase-end": 
        return isGroup2 ? "bg-sky-500" : "bg-blue-500";
      case "deadline": 
        return isGroup2 ? "bg-rose-500" : "bg-red-600";
      case "milestone": 
        return isGroup2 ? "bg-amber-500" : "bg-yellow-500";
      default: 
        return "bg-gray-500";
    }
  };

  const prevPeriod = () => {
    if (viewMode === "week") {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    }
  };

  const nextPeriod = () => {
    if (viewMode === "week") {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= thirtyDaysFromNow;
    }).slice(0, 5);
  }, [events]);

  const getHeaderTitle = () => {
    if (viewMode === "week") {
      const weekNum = getWeekNumber(currentDate);
      const firstDay = getWeekDays[0];
      const lastDay = getWeekDays[6];
      return `Vecka ${weekNum} (${firstDay.getDate()} ${MONTHS[firstDay.getMonth()].slice(0, 3)} - ${lastDay.getDate()} ${MONTHS[lastDay.getMonth()].slice(0, 3)})`;
    }
    return `${MONTHS[currentMonth]} ${currentYear}`;
  };

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
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {getHeaderTitle()}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList className="h-8">
                <TabsTrigger value="week" className="text-xs px-3">Vecka</TabsTrigger>
                <TabsTrigger value="month" className="text-xs px-3">Månad</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Idag
            </Button>
            <Button variant="outline" size="icon" onClick={prevPeriod}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextPeriod}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Veckodagar header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {(viewMode === "week" ? WEEKDAYS_FULL : WEEKDAYS).map((day, i) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {viewMode === "week" ? WEEKDAYS[i] : day}
              </div>
            ))}
          </div>
          
          {/* Veckovisning */}
          {viewMode === "week" && (
            <div className="grid grid-cols-7 gap-1">
              {getWeekDays.map((date, index) => {
                const dayEvents = getEventsForDate(date);
                return (
                  <div
                    key={index}
                    className={`min-h-[200px] p-2 border rounded-md bg-background ${
                      isToday(date) ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{WEEKDAYS_FULL[index]}</span>
                      <span className={`text-lg font-bold ${isToday(date) ? "text-primary" : ""}`}>
                        {date.getDate()}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs px-2 py-1 rounded text-white ${getEventColor(event.type, event.group)}`}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Månadsvisning */}
          {viewMode === "month" && (
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
                          className={`text-xs px-1 py-0.5 rounded truncate text-white ${getEventColor(event.type, event.group)}`}
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
          )}
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
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${getEventColor(event.type, event.group)}`} />
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
