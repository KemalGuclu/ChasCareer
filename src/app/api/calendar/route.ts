import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "TEACHER";

  try {
    // Hämta användarens career-grupp
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { careerGroup: true },
    });

    // Hämta fas-scheman
    let phaseSchedules;
    if (isAdmin) {
      // Admin ser alla gruppernas scheman
      phaseSchedules = await prisma.phaseSchedule.findMany({
        include: { careerGroup: true },
        orderBy: { startDate: "asc" },
      });
    } else if (user?.careerGroupId) {
      // Student ser bara sin grupps schema
      phaseSchedules = await prisma.phaseSchedule.findMany({
        where: { careerGroupId: user.careerGroupId },
        include: { careerGroup: true },
        orderBy: { startDate: "asc" },
      });
    } else {
      phaseSchedules = [];
    }

    // Hämta milestones med deadlines
    const milestones = await prisma.milestone.findMany({
      where: { deadline: { not: null } },
      orderBy: { deadline: "asc" },
    });

    // Formatera events för kalendern
    type CalendarEvent = {
      id: string;
      title: string;
      date: Date;
      type: string;
      group?: string;
    };
    const events: CalendarEvent[] = [];

    // Lägg till fas-events
    for (const schedule of phaseSchedules) {
      const phaseNames: Record<string, string> = {
        PHASE_1: "FAS 1",
        PHASE_2: "FAS 2",
        PHASE_3: "FAS 3",
        PHASE_4: "FAS 4",
      };

      // För admin: lägg till gruppnamn i titeln
      const groupSuffix = isAdmin ? ` (${schedule.careerGroup.name.split(" ")[0]})` : "";

      events.push({
        id: `phase-start-${schedule.id}`,
        title: `${phaseNames[schedule.phase]} börjar${groupSuffix}`,
        date: schedule.startDate,
        type: "phase-start",
        group: isAdmin ? schedule.careerGroup.name : undefined,
      });

      events.push({
        id: `phase-end-${schedule.id}`,
        title: `${phaseNames[schedule.phase]} slutar${groupSuffix}`,
        date: schedule.endDate,
        type: "phase-end",
        group: isAdmin ? schedule.careerGroup.name : undefined,
      });

      if (schedule.deadline) {
        events.push({
          id: `deadline-${schedule.id}`,
          title: `Deadline: ${phaseNames[schedule.phase]}${groupSuffix}`,
          date: schedule.deadline,
          type: "deadline",
          group: isAdmin ? schedule.careerGroup.name : undefined,
        });
      }
    }

    // Lägg till milestone-events
    for (const milestone of milestones) {
      if (milestone.deadline) {
        events.push({
          id: `milestone-${milestone.id}`,
          title: milestone.name,
          date: milestone.deadline,
          type: "milestone",
        });
      }
    }

    // Sortera events efter datum
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Failed to fetch calendar events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
