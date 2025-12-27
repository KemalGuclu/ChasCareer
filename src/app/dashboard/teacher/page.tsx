import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, GraduationCap, Target, Briefcase } from "lucide-react";

export default async function TeacherPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "TEACHER") {
    redirect("/dashboard");
  }

  // Hämta alla career-grupper med deras studenter och progression
  const careerGroups = await prisma.careerGroup.findMany({
    include: {
      education: true,
      members: {
        include: {
          progression: {
            include: {
              milestones: true,
            },
          },
          liaPlacement: true,
          leads: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Beräkna statistik per grupp
  const groupStats = careerGroups.map((group) => {
    const students = group.members;
    const totalStudents = students.length;
    
    // Beräkna genomsnittlig progression
    const progressions = students.map((s) => {
      if (!s.progression) return 0;
      const completed = s.progression.milestones.filter((m) => m.completed).length;
      const total = s.progression.milestones.length;
      return total > 0 ? (completed / total) * 100 : 0;
    });
    const avgProgress = progressions.length > 0
      ? Math.round(progressions.reduce((a, b) => a + b, 0) / progressions.length)
      : 0;

    // Räkna LIA-status
    const withLia = students.filter((s) => s.liaPlacement).length;
    
    // Totala leads
    const totalLeads = students.reduce((sum, s) => sum + s.leads.length, 0);

    return {
      id: group.id,
      name: group.name,
      education: group.education.name,
      totalStudents,
      avgProgress,
      withLia,
      totalLeads,
      students,
    };
  });

  // Totala siffror
  const totalStats = {
    groups: careerGroups.length,
    students: groupStats.reduce((sum, g) => sum + g.totalStudents, 0),
    avgProgress: groupStats.length > 0
      ? Math.round(groupStats.reduce((sum, g) => sum + g.avgProgress, 0) / groupStats.length)
      : 0,
    withLia: groupStats.reduce((sum, g) => sum + g.withLia, 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mina Grupper</h1>
        <p className="text-muted-foreground">
          Översikt över career-grupper och deras progression
        </p>
      </div>

      {/* Sammanfattning */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Grupper</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.groups}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Studerande</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.students}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Snitt Progression</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.avgProgress}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Med LIA</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.withLia}</div>
          </CardContent>
        </Card>
      </div>

      {/* Grupper */}
      <div className="grid gap-6 md:grid-cols-2">
        {groupStats.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription>{group.education}</CardDescription>
                </div>
                <Badge variant="outline">{group.totalStudents} studerande</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Genomsnittlig progression</span>
                  <span className="font-medium">{group.avgProgress}%</span>
                </div>
                <Progress value={group.avgProgress} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{group.withLia} med LIA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>{group.totalLeads} leads totalt</span>
                </div>
              </div>

              {/* Studentlista */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Studerande</p>
                <div className="space-y-2">
                  {group.students.slice(0, 5).map((student) => {
                    const progress = student.progression
                      ? Math.round(
                          (student.progression.milestones.filter((m) => m.completed).length /
                            student.progression.milestones.length) *
                            100
                        ) || 0
                      : 0;
                    
                    return (
                      <div key={student.id} className="flex items-center justify-between text-sm">
                        <span>{student.name || student.email}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="w-20 h-2" />
                          <span className="text-muted-foreground w-10 text-right">{progress}%</span>
                        </div>
                      </div>
                    );
                  })}
                  {group.students.length > 5 && (
                    <p className="text-sm text-muted-foreground">
                      + {group.students.length - 5} till...
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {careerGroups.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Inga career-grupper hittades.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
