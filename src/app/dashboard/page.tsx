import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Users, 
  Building2, 
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { PhaseDistributionChart, LiaStatusChart } from "@/components/charts/progress-charts";

async function getAdminStats() {
  const [totalStudents, studentsWithLia, phaseStats] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.liaPlacement.count({ where: { status: { in: ["APPROVED", "ACTIVE"] } } }),
    prisma.progression.groupBy({
      by: ["currentPhase"],
      _count: true,
    }),
  ]);

  const phases = {
    PHASE_1: 0,
    PHASE_2: 0,
    PHASE_3: 0,
    PHASE_4: 0,
  };

  phaseStats.forEach((p) => {
    phases[p.currentPhase] = p._count;
  });

  return { totalStudents, studentsWithLia, phases };
}

async function getStudentStats(userId: string) {
  const [progression, leadCount, contactCount] = await Promise.all([
    prisma.progression.findUnique({
      where: { userId },
      include: { milestones: { include: { milestone: true } } },
    }),
    prisma.lead.count({ where: { userId } }),
    prisma.lead.count({ where: { userId, status: { not: "NEW" } } }),
  ]);

  return {
    currentPhase: progression?.currentPhase || "PHASE_1",
    completedMilestones: progression?.milestones.filter(m => m.completed).length || 0,
    totalMilestones: progression?.milestones.length || 0,
    leadCount,
    contactCount,
  };
}

const phaseNames: Record<string, string> = {
  PHASE_1: "FAS 1: Intro",
  PHASE_2: "FAS 2: Nätverkande",
  PHASE_3: "FAS 3: LIA-sök",
  PHASE_4: "FAS 4: Jobb-sök",
};

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN" || user?.role === "TEACHER";

  // Hämta stats baserat på roll
  const adminStats = isAdmin ? await getAdminStats() : null;
  const studentStats = !isAdmin && user?.id ? await getStudentStats(user.id) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Välkommen, {user?.name || "användare"}!
        </h1>
        <p className="text-muted-foreground">
          {isAdmin 
            ? "Här är en översikt över alla studerandes progression."
            : "Här ser du din progression genom Chas Career."
          }
        </p>
      </div>

      {/* Student Dashboard */}
      {!isAdmin && studentStats && (
        <>
          {/* Current Phase Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Din nuvarande fas</CardTitle>
                <Badge variant="default">{phaseNames[studentStats.currentPhase]}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-2">
                <div className="flex justify-between text-sm mb-2">
                  <span>Avklarade moment</span>
                  <span className="font-medium">
                    {studentStats.completedMilestones} / {studentStats.totalMilestones || "?"}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full">
                  <div 
                    className="h-2 bg-primary rounded-full transition-all"
                    style={{ 
                      width: studentStats.totalMilestones 
                        ? `${(studentStats.completedMilestones / studentStats.totalMilestones) * 100}%` 
                        : "0%" 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leads i CRM</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{studentStats.leadCount}</div>
                <p className="text-xs text-muted-foreground">Mål: 90 leads</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kontakter</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{studentStats.contactCount}</div>
                <p className="text-xs text-muted-foreground">Mål: 15 kontakter</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Studiebesök</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Mål: 5 besök</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nästa deadline</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold">Career Workshop 3</div>
                <p className="text-xs text-muted-foreground">15 januari 2025</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Admin Dashboard */}
      {isAdmin && adminStats && (
        <>
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Totalt studerande</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">Aktiva i Chas Career</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">LIA säkrad</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats.studentsWithLia}</div>
                <p className="text-xs text-muted-foreground">
                  {adminStats.phases.PHASE_3 > 0 
                    ? `${Math.round((adminStats.studentsWithLia / adminStats.phases.PHASE_3) * 100)}% av FAS 3`
                    : "Ingen i FAS 3"
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Väntar granskning</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">LIA-registreringar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trend</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12%</div>
                <p className="text-xs text-muted-foreground">Leads denna vecka</p>
              </CardContent>
            </Card>
          </div>

          {/* Phase Distribution Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <PhaseDistributionChart 
              data={adminStats.phases} 
              totalStudents={adminStats.totalStudents} 
            />
            <LiaStatusChart 
              withLia={adminStats.studentsWithLia} 
              total={adminStats.totalStudents} 
            />
          </div>
        </>
      )}
    </div>
  );
}
