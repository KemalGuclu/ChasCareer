import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { milestoneId, completed } = await request.json();

    if (!milestoneId || typeof completed !== "boolean") {
      return NextResponse.json(
        { error: "milestoneId and completed are required" },
        { status: 400 }
      );
    }

    // Hämta eller skapa progression för användaren
    let progression = await prisma.progression.findUnique({
      where: { userId: session.user.id },
    });

    if (!progression) {
      progression = await prisma.progression.create({
        data: {
          userId: session.user.id,
          currentPhase: "PHASE_1",
        },
      });
    }

    // Uppdatera eller skapa milestone progress
    const milestoneProgress = await prisma.milestoneProgress.upsert({
      where: {
        progressionId_milestoneId: {
          progressionId: progression.id,
          milestoneId: milestoneId,
        },
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
      },
      create: {
        progressionId: progression.id,
        milestoneId: milestoneId,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, milestoneProgress });
  } catch (error) {
    console.error("Error updating milestone:", error);
    return NextResponse.json(
      { error: "Failed to update milestone" },
      { status: 500 }
    );
  }
}
