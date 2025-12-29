import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CalendarView } from "@/components/calendar-view";

export default async function CalendarPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kalender</h1>
        <p className="text-muted-foreground">
          Översikt över viktiga datum, deadlines och fas-scheman
        </p>
      </div>

      <CalendarView />
    </div>
  );
}
