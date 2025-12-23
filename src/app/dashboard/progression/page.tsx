import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProgressionView } from "./progression-view";

export default async function ProgressionPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Hämta användarens progression med milestones
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      careerGroup: {
        include: {
          phaseSchedules: true,
        },
      },
      progression: {
        include: {
          milestones: {
            include: {
              milestone: true,
            },
          },
        },
      },
    },
  });

  // Hämta alla milestones
  const allMilestones = await prisma.milestone.findMany({
    orderBy: [{ phase: "asc" }, { name: "asc" }],
  });

  // Om ingen progression finns, skapa en
  if (user && !user.progression) {
    await prisma.progression.create({
      data: {
        userId: user.id,
        currentPhase: "PHASE_1",
      },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Min Progression</h1>
        <p className="text-muted-foreground">
          Följ din resa genom Chas Career och markera avklarade moment
        </p>
      </div>

      <ProgressionView 
        user={user}
        allMilestones={allMilestones}
      />
    </div>
  );
}
