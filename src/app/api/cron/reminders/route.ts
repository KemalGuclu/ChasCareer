import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendToSlack, createDeadlineReminder } from "@/app/api/slack/route";

// Denna endpoint kan anropas av Vercel Cron eller extern cron-tjänst
// Kollar om några studerande har deadlines som närmar sig

export async function GET(request: Request) {
  try {
    // Verifiera att anropet kommer från cron (secret header)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

    // Hämta alla fas-scheman med deadlines som närmar sig
    const upcomingDeadlines = await prisma.phaseSchedule.findMany({
      where: {
        deadline: {
          gte: now,
          lte: in7Days,
        },
      },
      include: {
        careerGroup: {
          include: {
            members: {
              where: { role: "STUDENT" },
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const notifications: { studentName: string; phase: string; daysLeft: number }[] = [];

    for (const schedule of upcomingDeadlines) {
      if (!schedule.deadline) continue;
      const deadlineDate = new Date(schedule.deadline);
      const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Skicka påminnelser endast för 7 dagar och 1 dag kvar
      if (daysLeft === 7 || daysLeft === 1) {
        for (const student of schedule.careerGroup.members) {
          const studentName = student.name || student.email;
          const phaseLabel = `Fas ${schedule.phase.replace("PHASE_", "")}`;
          
          // Skicka till Slack
          await sendToSlack(
            createDeadlineReminder(
              studentName,
              deadlineDate.toLocaleDateString("sv-SE"),
              phaseLabel,
              daysLeft
            )
          );

          notifications.push({
            studentName,
            phase: phaseLabel,
            daysLeft,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      sent: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to process reminders" },
      { status: 500 }
    );
  }
}

// POST för manuell trigger från admin
export async function POST(request: Request) {
  // Samma logik som GET men utan autentisering för admin
  return GET(request);
}
