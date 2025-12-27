import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ReportsView } from "./reports-view";

export default async function ReportsPage() {
  const session = await auth();
  
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    redirect("/dashboard");
  }

  // Hämta alla studerande med deras data
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      careerGroup: {
        include: {
          education: true,
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
      leads: {
        include: {
          company: true,
        },
      },
      liaPlacement: {
        include: {
          company: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Hämta alla karriärgrupper för grupprapporter
  const careerGroups = await prisma.careerGroup.findMany({
    include: {
      education: true,
      members: {
        where: { role: "STUDENT" },
        include: {
          progression: {
            include: {
              milestones: {
                include: {
                  milestone: true,
                },
              },
            },
          },
          leads: true,
          liaPlacement: {
            include: {
              company: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Hämta alla utbildningar för klassrapporter
  const educations = await prisma.education.findMany({
    include: {
      careerGroups: {
        include: {
          members: {
            where: { role: "STUDENT" },
            include: {
              progression: {
                include: {
                  milestones: {
                    include: {
                      milestone: true,
                    },
                  },
                },
              },
              leads: true,
              liaPlacement: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rapporter</h1>
        <p className="text-muted-foreground">
          Generera och exportera rapporter för individer, grupper och klasser
        </p>
      </div>

      <ReportsView students={students} careerGroups={careerGroups} educations={educations} />
    </div>
  );
}
