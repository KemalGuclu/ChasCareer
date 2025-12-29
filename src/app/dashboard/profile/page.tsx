import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  GraduationCap, 
  Target, 
  Briefcase, 
  Users,
  Calendar,
  CheckCircle2,
  Clock,
} from "lucide-react";

const phaseNames: Record<string, string> = {
  PHASE_1: "FAS 1: Intro",
  PHASE_2: "FAS 2: Nätverkande",
  PHASE_3: "FAS 3: LIA-sök",
  PHASE_4: "FAS 4: Jobb-sök",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Hämta användardata med all relaterad info
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      careerGroup: {
        include: {
          education: true,
          phaseSchedules: true,
        },
      },
      progression: {
        include: {
          milestones: {
            include: { milestone: true },
          },
        },
      },
      leads: {
        include: { company: true },
      },
      liaPlacement: {
        include: { company: true },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Beräkna statistik
  const completedMilestones = user.progression?.milestones.filter(m => m.completed).length || 0;
  const totalMilestones = user.progression?.milestones.length || 0;
  const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  
  const currentPhase = user.progression?.currentPhase || "PHASE_1";
  const leadCount = user.leads.length;
  const contactedLeads = user.leads.filter(l => l.status !== "NEW").length;

  // Hämta aktuellt fas-schema
  const currentPhaseSchedule = user.careerGroup?.phaseSchedules.find(
    s => s.phase === currentPhase
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Min Profil</h1>
        <p className="text-muted-foreground">
          Din personliga information och karriärstatus
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profil-kort */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src={user.image || ""} alt={user.name || ""} />
              <AvatarFallback className="text-2xl">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{user.name || "Okänd användare"}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {user.careerGroup?.education.name || "Ingen utbildning"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {user.careerGroup?.name || "Ingen grupp"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Medlem sedan {user.createdAt.toLocaleDateString("sv-SE")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Progression och statistik */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Din Progression
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nuvarande fas */}
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Nuvarande fas</span>
                <Badge variant="default">{phaseNames[currentPhase]}</Badge>
              </div>
              {currentPhaseSchedule && (
                <p className="text-sm text-muted-foreground">
                  {currentPhaseSchedule.startDate.toLocaleDateString("sv-SE")} - {currentPhaseSchedule.endDate.toLocaleDateString("sv-SE")}
                </p>
              )}
            </div>

            {/* Progression bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total progression</span>
                <span className="font-medium">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {completedMilestones} av {totalMilestones} milestones avklarade
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <div className="text-2xl font-bold">{leadCount}</div>
                <div className="text-sm text-muted-foreground">Leads i CRM</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <div className="text-2xl font-bold">{contactedLeads}</div>
                <div className="text-sm text-muted-foreground">Kontaktade</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* LIA-status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            LIA-status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.liaPlacement ? (
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{user.liaPlacement.company.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {user.liaPlacement.supervisor && `Handledare: ${user.liaPlacement.supervisor}`}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant={user.liaPlacement.status === "APPROVED" ? "default" : "secondary"}>
                    {user.liaPlacement.status === "APPROVED" ? "Godkänd" : 
                     user.liaPlacement.status === "ACTIVE" ? "Pågående" : 
                     user.liaPlacement.status === "PENDING" ? "Väntar" : user.liaPlacement.status}
                  </Badge>
                  {user.liaPlacement.startDate && user.liaPlacement.endDate && (
                    <span className="text-sm text-muted-foreground">
                      {user.liaPlacement.startDate.toLocaleDateString("sv-SE")} - {user.liaPlacement.endDate.toLocaleDateString("sv-SE")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              <div className="p-3 bg-muted rounded-full">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Ingen LIA-placering ännu</h3>
                <p className="text-sm text-muted-foreground">
                  Fortsätt söka via dina leads. Du har {leadCount} leads att arbeta med.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Milestones per fas */}
      <Card>
        <CardHeader>
          <CardTitle>Milestones per fas</CardTitle>
          <CardDescription>Din progression genom utbildningens faser</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {["PHASE_1", "PHASE_2", "PHASE_3", "PHASE_4"].map((phase) => {
              const phaseMilestones = user.progression?.milestones.filter(
                m => m.milestone.phase === phase
              ) || [];
              const phaseCompleted = phaseMilestones.filter(m => m.completed).length;
              const phaseTotal = phaseMilestones.length;
              const phasePercent = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;

              return (
                <div 
                  key={phase} 
                  className={`p-4 rounded-lg border ${
                    phase === currentPhase ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">
                      {phaseNames[phase].split(":")[0]}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {phaseCompleted}/{phaseTotal}
                    </span>
                  </div>
                  <Progress value={phasePercent} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {phasePercent}% klart
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
