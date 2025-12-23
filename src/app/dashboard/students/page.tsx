import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StudentList } from "./student-list";

export default async function StudentsPage() {
  const session = await auth();
  
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    redirect("/dashboard");
  }

  // Hämta alla studerande med deras progression och career group
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      careerGroup: true,
      progression: true,
      leads: { select: { id: true } },
      liaPlacement: { select: { status: true } },
    },
    orderBy: { name: "asc" },
  });

  // Hämta alla career groups för filtrering
  const careerGroups = await prisma.careerGroup.findMany({
    include: { education: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Studerande</h1>
        <p className="text-muted-foreground">
          Hantera och följ upp alla studerandes progression
        </p>
      </div>

      <StudentList 
        students={students} 
        careerGroups={careerGroups}
      />
    </div>
  );
}
