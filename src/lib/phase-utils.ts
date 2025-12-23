import { prisma } from "@/lib/prisma";

// Hämta aktuell fas för en career group baserat på datum
export async function getCurrentPhaseForGroup(careerGroupId: string) {
  const now = new Date();
  
  const currentSchedule = await prisma.phaseSchedule.findFirst({
    where: {
      careerGroupId,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { startDate: "desc" },
  });
  
  return currentSchedule;
}

// Hämta fas-schema för en specifik fas
export async function getPhaseSchedule(careerGroupId: string, phase: string) {
  return prisma.phaseSchedule.findUnique({
    where: {
      careerGroupId_phase: {
        careerGroupId,
        phase: phase as "PHASE_1" | "PHASE_2" | "PHASE_3" | "PHASE_4",
      },
    },
  });
}

// Hämta alla fas-scheman för en grupp
export async function getAllPhaseSchedules(careerGroupId: string) {
  return prisma.phaseSchedule.findMany({
    where: { careerGroupId },
    orderBy: { startDate: "asc" },
  });
}

// Kolla om en student kan vara i en viss fas
export async function canStudentBeInPhase(
  careerGroupId: string,
  phase: string
): Promise<{ allowed: boolean; reason?: string; schedule?: { startDate: Date; endDate: Date } }> {
  const now = new Date();
  
  const schedule = await getPhaseSchedule(careerGroupId, phase);
  
  if (!schedule) {
    return { allowed: false, reason: "Fas-schema saknas för denna grupp" };
  }
  
  if (now < schedule.startDate) {
    return { 
      allowed: false, 
      reason: `Fasen börjar ${schedule.startDate.toLocaleDateString("sv-SE")}`,
      schedule: { startDate: schedule.startDate, endDate: schedule.endDate }
    };
  }
  
  return { 
    allowed: true,
    schedule: { startDate: schedule.startDate, endDate: schedule.endDate }
  };
}

// Beräkna dagar kvar till deadline
export function getDaysUntilDeadline(deadline: Date): number {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Bestäm fas-status
export type PhaseStatus = "not_started" | "active" | "deadline_soon" | "past_deadline" | "completed";

export function getPhaseStatus(
  startDate: Date,
  endDate: Date,
  deadline?: Date | null
): PhaseStatus {
  const now = new Date();
  
  if (now < startDate) {
    return "not_started";
  }
  
  if (now > endDate) {
    return "completed";
  }
  
  if (deadline) {
    const daysUntil = getDaysUntilDeadline(deadline);
    if (daysUntil < 0) {
      return "past_deadline";
    }
    if (daysUntil <= 14) {
      return "deadline_soon";
    }
  }
  
  return "active";
}

export const phaseNames: Record<string, string> = {
  PHASE_1: "FAS 1: Intro",
  PHASE_2: "FAS 2: Nätverkande",
  PHASE_3: "FAS 3: LIA-sök",
  PHASE_4: "FAS 4: Jobb-sök",
};
