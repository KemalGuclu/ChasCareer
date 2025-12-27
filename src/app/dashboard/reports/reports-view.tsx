"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  FileText,
  Download,
  Users,
  User,
  Target,
  Briefcase,
  Building2,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

type Milestone = {
  id: string;
  name: string;
  phase: string;
};

type MilestoneProgress = {
  id: string;
  completed: boolean;
  milestone: Milestone;
};

type Progression = {
  id: string;
  currentPhase: string;
  milestones: MilestoneProgress[];
};

type Lead = {
  id: string;
  status: string;
};

type LiaPlacement = {
  id: string;
  status: string;
  company: {
    name: string;
  };
};

type CareerGroup = {
  id: string;
  name: string;
  education: {
    name: string;
  };
};

type Student = {
  id: string;
  name: string | null;
  email: string;
  careerGroup: (CareerGroup & { education: { name: string } }) | null;
  progression: Progression | null;
  leads: Lead[];
  liaPlacement: LiaPlacement | null;
};

type GroupWithStudents = {
  id: string;
  name: string;
  education: { name: string };
  members: {
    id: string;
    name: string | null;
    email: string;
    progression: Progression | null;
    leads: Lead[];
    liaPlacement: LiaPlacement | null;
  }[];
};

type EducationMember = {
  id: string;
  name: string | null;
  email: string;
  progression: Progression | null;
  leads: Lead[];
  liaPlacement: { id: string; status: string } | null;
};

type Education = {
  id: string;
  name: string;
  careerGroups: {
    id: string;
    name: string;
    members: EducationMember[];
  }[];
};

type Props = {
  students: Student[];
  careerGroups: GroupWithStudents[];
  educations: Education[];
};

const phaseLabels: Record<string, string> = {
  PHASE_1: "Fas 1",
  PHASE_2: "Fas 2",
  PHASE_3: "Fas 3",
  PHASE_4: "Fas 4",
};

export function ReportsView({ students, careerGroups, educations }: Props) {
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedEducation, setSelectedEducation] = useState<string>("");

  // Beräkna statistik för en student
  const getStudentStats = (student: {
    progression: Progression | null;
    leads: Lead[];
    liaPlacement: LiaPlacement | null;
  }) => {
    const totalMilestones = student.progression?.milestones.length || 0;
    const completedMilestones = student.progression?.milestones.filter((m) => m.completed).length || 0;
    const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    
    return {
      currentPhase: student.progression?.currentPhase || "PHASE_1",
      progressPercent,
      completedMilestones,
      totalMilestones,
      totalLeads: student.leads.length,
      activeLeads: student.leads.filter((l) => !l.status.startsWith("CLOSED")).length,
      hasLia: !!student.liaPlacement,
      liaStatus: student.liaPlacement?.status || null,
      liaCompany: student.liaPlacement?.company.name || null,
    };
  };

  // Beräkna statistik för en grupp
  const getGroupStats = (group: GroupWithStudents) => {
    const totalStudents = group.members.length;
    const studentStats = group.members.map(getStudentStats);
    
    const avgProgress = totalStudents > 0 
      ? Math.round(studentStats.reduce((sum, s) => sum + s.progressPercent, 0) / totalStudents)
      : 0;
    
    const phaseDistribution = {
      PHASE_1: studentStats.filter((s) => s.currentPhase === "PHASE_1").length,
      PHASE_2: studentStats.filter((s) => s.currentPhase === "PHASE_2").length,
      PHASE_3: studentStats.filter((s) => s.currentPhase === "PHASE_3").length,
      PHASE_4: studentStats.filter((s) => s.currentPhase === "PHASE_4").length,
    };
    
    const studentsWithLia = studentStats.filter((s) => s.hasLia).length;
    const totalLeads = studentStats.reduce((sum, s) => sum + s.totalLeads, 0);
    
    return {
      totalStudents,
      avgProgress,
      phaseDistribution,
      studentsWithLia,
      totalLeads,
    };
  };

  const selectedStudentData = students.find((s) => s.id === selectedStudent);
  const selectedGroupData = careerGroups.find((g) => g.id === selectedGroup);

  const downloadCSV = (data: string[][], filename: string) => {
    const csvContent = data.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const exportStudentReport = () => {
    if (!selectedStudentData) return;
    const stats = getStudentStats(selectedStudentData);
    
    const data = [
      ["Studeranderapport", new Date().toLocaleDateString("sv-SE")],
      [""],
      ["Namn", selectedStudentData.name || "—"],
      ["Email", selectedStudentData.email],
      ["Grupp", selectedStudentData.careerGroup?.name || "—"],
      ["Utbildning", selectedStudentData.careerGroup?.education.name || "—"],
      [""],
      ["Nuvarande fas", phaseLabels[stats.currentPhase]],
      ["Progression", `${stats.progressPercent}%`],
      ["Avklarade moment", `${stats.completedMilestones} av ${stats.totalMilestones}`],
      [""],
      ["Antal leads", stats.totalLeads.toString()],
      ["Aktiva leads", stats.activeLeads.toString()],
      ["LIA-plats", stats.hasLia ? stats.liaCompany || "Ja" : "Nej"],
      ["LIA-status", stats.liaStatus || "—"],
    ];
    
    downloadCSV(data, `rapport_${selectedStudentData.name?.replace(/\s/g, "_") || selectedStudentData.email}_${new Date().toISOString().split("T")[0]}.csv`);
  };

  const exportGroupReport = () => {
    if (!selectedGroupData) return;
    const stats = getGroupStats(selectedGroupData);
    
    const header = ["Namn", "Email", "Fas", "Progression", "Leads", "LIA"];
    const rows = selectedGroupData.members.map((student) => {
      const s = getStudentStats(student);
      return [
        student.name || "—",
        student.email,
        phaseLabels[s.currentPhase],
        `${s.progressPercent}%`,
        s.totalLeads.toString(),
        s.hasLia ? "Ja" : "Nej",
      ];
    });
    
    const data = [
      [`Grupprapport: ${selectedGroupData.name}`, new Date().toLocaleDateString("sv-SE")],
      [""],
      ["Totalt studerande", stats.totalStudents.toString()],
      ["Genomsnittlig progression", `${stats.avgProgress}%`],
      ["Med LIA-plats", stats.studentsWithLia.toString()],
      ["Totalt leads", stats.totalLeads.toString()],
      [""],
      header,
      ...rows,
    ];
    
    downloadCSV(data, `grupprapport_${selectedGroupData.name.replace(/\s/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`);
  };

  return (
    <Tabs defaultValue="individual" className="space-y-4">
      <TabsList>
        <TabsTrigger value="individual" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Individrapport
        </TabsTrigger>
        <TabsTrigger value="group" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Grupprapport
        </TabsTrigger>
        <TabsTrigger value="class" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Klassrapport
        </TabsTrigger>
      </TabsList>

      {/* Individrapport */}
      <TabsContent value="individual" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Välj studerande</CardTitle>
            <CardDescription>Generera detaljerad rapport för en enskild studerande</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Välj studerande..." />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name || student.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedStudentData && (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              {(() => {
                const stats = getStudentStats(selectedStudentData);
                return (
                  <>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          Nuvarande Fas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{phaseLabels[stats.currentPhase]}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          Progression
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.progressPercent}%</div>
                        <p className="text-xs text-muted-foreground">
                          {stats.completedMilestones} av {stats.totalMilestones} moment
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-purple-600" />
                          Leads
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalLeads}</div>
                        <p className="text-xs text-muted-foreground">
                          {stats.activeLeads} aktiva
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-orange-600" />
                          LIA-plats
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {stats.hasLia ? (
                          <>
                            <div className="text-lg font-bold truncate">{stats.liaCompany}</div>
                            <Badge className="mt-1">{stats.liaStatus}</Badge>
                          </>
                        ) : (
                          <div className="text-muted-foreground">Ej registrerad</div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                );
              })()}
            </div>

            {/* Leads-lista */}
            {selectedStudentData.leads.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Leads</CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table className="min-w-[400px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Företag</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedStudentData.leads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">Lead #{lead.id.slice(-6)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{lead.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2">
              <Button onClick={exportStudentReport} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                CSV
              </Button>
              <Button 
                onClick={() => {
                  window.open(`/api/reports/pdf?type=student&studentId=${selectedStudent}`, '_blank');
                }}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </>
        )}
      </TabsContent>

      {/* Grupprapport */}
      <TabsContent value="group" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Välj grupp</CardTitle>
            <CardDescription>Generera rapport för en hel Career-grupp</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Välj grupp..." />
              </SelectTrigger>
              <SelectContent>
                {careerGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name} ({group.education.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedGroupData && (
          <>
            {(() => {
              const stats = getGroupStats(selectedGroupData);
              return (
                <>
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Studerande</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalStudents}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Snitt-progression</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.avgProgress}%</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Med LIA</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.studentsWithLia}</div>
                        <p className="text-xs text-muted-foreground">
                          av {stats.totalStudents} ({Math.round((stats.studentsWithLia / stats.totalStudents) * 100) || 0}%)
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Totalt leads</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalLeads}</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Fas-fördelning */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Fas-fördelning</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4">
                        {Object.entries(stats.phaseDistribution).map(([phase, count]) => (
                          <div key={phase} className="text-center p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold">{count}</div>
                            <div className="text-sm text-muted-foreground">{phaseLabels[phase]}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Studerandelista */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Studerande i gruppen</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                      <Table className="min-w-[600px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Namn</TableHead>
                            <TableHead>Fas</TableHead>
                            <TableHead>Progression</TableHead>
                            <TableHead>Leads</TableHead>
                            <TableHead>LIA</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedGroupData.members.map((student) => {
                            const s = getStudentStats(student);
                            return (
                              <TableRow key={student.id}>
                                <TableCell className="font-medium">
                                  {student.name || student.email}
                                </TableCell>
                                <TableCell>{phaseLabels[s.currentPhase]}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 bg-muted rounded-full h-2">
                                      <div 
                                        className="bg-green-600 h-2 rounded-full" 
                                        style={{ width: `${s.progressPercent}%` }}
                                      />
                                    </div>
                                    <span className="text-sm">{s.progressPercent}%</span>
                                  </div>
                                </TableCell>
                                <TableCell>{s.totalLeads}</TableCell>
                                <TableCell>
                                  {s.hasLia ? (
                                    <Badge className="bg-green-100 text-green-800">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Ja
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground">Nej</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <div className="flex gap-2">
                    <Button onClick={exportGroupReport} variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      CSV
                    </Button>
                    <Button 
                      onClick={() => {
                        window.open(`/api/reports/pdf?type=group&groupId=${selectedGroup}`, '_blank');
                      }}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                </>
              );
            })()}
          </>
        )}
      </TabsContent>

      {/* Klassrapport */}
      <TabsContent value="class" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Välj utbildning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedEducation} onValueChange={setSelectedEducation}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Välj utbildning..." />
              </SelectTrigger>
              <SelectContent>
                {educations.map((edu) => (
                  <SelectItem key={edu.id} value={edu.id}>
                    {edu.name} ({edu.careerGroups.reduce((sum, g) => sum + g.members.length, 0)} studerande)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedEducation && (() => {
          const education = educations.find((e) => e.id === selectedEducation);
          if (!education) return null;

          const allStudents = education.careerGroups.flatMap((g) => g.members);
          const totalStudents = allStudents.length;
          
          const studentStats = allStudents.map((s) => {
            const totalMilestones = s.progression?.milestones.length || 0;
            const completedMilestones = s.progression?.milestones.filter((m) => m.completed).length || 0;
            const progressPercent = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
            return {
              progressPercent,
              currentPhase: s.progression?.currentPhase || "PHASE_1",
              hasLia: !!s.liaPlacement,
              totalLeads: s.leads.length,
            };
          });

          const avgProgress = totalStudents > 0 
            ? Math.round(studentStats.reduce((sum, s) => sum + s.progressPercent, 0) / totalStudents)
            : 0;
          
          const phaseDistribution = {
            PHASE_1: studentStats.filter((s) => s.currentPhase === "PHASE_1").length,
            PHASE_2: studentStats.filter((s) => s.currentPhase === "PHASE_2").length,
            PHASE_3: studentStats.filter((s) => s.currentPhase === "PHASE_3").length,
            PHASE_4: studentStats.filter((s) => s.currentPhase === "PHASE_4").length,
          };
          
          const studentsWithLia = studentStats.filter((s) => s.hasLia).length;
          const totalLeads = studentStats.reduce((sum, s) => sum + s.totalLeads, 0);
          const liaPercent = totalStudents > 0 ? Math.round((studentsWithLia / totalStudents) * 100) : 0;

          const exportClassReport = () => {
            const header = ["Grupp", "Studerande", "Snitt Progression", "Med LIA", "Totalt Leads"];
            const rows = education.careerGroups.map((group) => {
              const members = group.members;
              const groupStats = members.map((s) => {
                const total = s.progression?.milestones.length || 0;
                const completed = s.progression?.milestones.filter((m) => m.completed).length || 0;
                return {
                  progress: total > 0 ? (completed / total) * 100 : 0,
                  hasLia: !!s.liaPlacement,
                  leads: s.leads.length,
                };
              });
              const avgProg = members.length > 0 
                ? Math.round(groupStats.reduce((s, st) => s + st.progress, 0) / members.length) 
                : 0;
              return [
                group.name,
                members.length.toString(),
                `${avgProg}%`,
                groupStats.filter((s) => s.hasLia).length.toString(),
                groupStats.reduce((s, st) => s + st.leads, 0).toString(),
              ];
            });
            
            const data = [
              [`Klassrapport: ${education.name}`, new Date().toLocaleDateString("sv-SE")],
              [""],
              ["Totalt studerande", totalStudents.toString()],
              ["Genomsnittlig progression", `${avgProgress}%`],
              ["Med LIA-plats", `${studentsWithLia} (${liaPercent}%)`],
              ["Totalt leads", totalLeads.toString()],
              [""],
              ["Fas-fördelning"],
              ["Fas 1", phaseDistribution.PHASE_1.toString()],
              ["Fas 2", phaseDistribution.PHASE_2.toString()],
              ["Fas 3", phaseDistribution.PHASE_3.toString()],
              ["Fas 4", phaseDistribution.PHASE_4.toString()],
              [""],
              header,
              ...rows,
            ];
            
            const csvContent = data.map((row) => row.join(",")).join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `klassrapport_${education.name.replace(/\s/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
            link.click();
          };

          return (
            <>
              {/* Sammanfattning */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Studerande</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalStudents}</div>
                    <p className="text-xs text-muted-foreground">{education.careerGroups.length} grupper</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Snitt Progression</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{avgProgress}%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Med LIA-plats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{studentsWithLia}</div>
                    <p className="text-xs text-muted-foreground">{liaPercent}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Totalt Leads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalLeads}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Fas-fördelning */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Fas-fördelning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    {Object.entries(phaseDistribution).map(([phase, count]) => (
                      <div key={phase} className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-sm text-muted-foreground">{phaseLabels[phase]}</div>
                        <div className="text-xs text-muted-foreground">
                          {totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Grupper */}
              <Card>
                <CardHeader>
                  <CardTitle>Grupper</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Grupp</TableHead>
                        <TableHead className="text-right">Studerande</TableHead>
                        <TableHead className="text-right">Snitt Progression</TableHead>
                        <TableHead className="text-right">Med LIA</TableHead>
                        <TableHead className="text-right">Leads</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {education.careerGroups.map((group) => {
                        const members = group.members;
                        const groupStats = members.map((s) => {
                          const total = s.progression?.milestones.length || 0;
                          const completed = s.progression?.milestones.filter((m) => m.completed).length || 0;
                          return {
                            progress: total > 0 ? (completed / total) * 100 : 0,
                            hasLia: !!s.liaPlacement,
                            leads: s.leads.length,
                          };
                        });
                        const avgProg = members.length > 0 
                          ? Math.round(groupStats.reduce((s, st) => s + st.progress, 0) / members.length) 
                          : 0;
                        return (
                          <TableRow key={group.id}>
                            <TableCell className="font-medium">{group.name}</TableCell>
                            <TableCell className="text-right">{members.length}</TableCell>
                            <TableCell className="text-right">{avgProg}%</TableCell>
                            <TableCell className="text-right">{groupStats.filter((s) => s.hasLia).length}</TableCell>
                            <TableCell className="text-right">{groupStats.reduce((s, st) => s + st.leads, 0)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button onClick={exportClassReport} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportera CSV
                </Button>
              </div>
            </>
          );
        })()}
      </TabsContent>
    </Tabs>
  );
}
