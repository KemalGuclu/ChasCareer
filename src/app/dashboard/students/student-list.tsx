"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Search, Filter, Users, X, ArrowUpDown, UserX } from "lucide-react";
import { SlackDMDialog } from "@/components/slack-dm-dialog";
import { EmptyState } from "@/components/empty-state";

type Student = {
  id: string;
  name: string | null;
  email: string;
  careerGroup: { id: string; name: string; region: string } | null;
  progression: { currentPhase: string } | null;
  leads: { id: string }[];
  liaPlacement: { status: string } | null;
};

type CareerGroup = {
  id: string;
  name: string;
  region: string;
  education: { name: string };
};

type Props = {
  students: Student[];
  careerGroups: CareerGroup[];
};

const phaseNames: Record<string, string> = {
  PHASE_1: "FAS 1",
  PHASE_2: "FAS 2",
  PHASE_3: "FAS 3",
  PHASE_4: "FAS 4",
};

const phaseColors: Record<string, string> = {
  PHASE_1: "bg-blue-100 text-blue-800",
  PHASE_2: "bg-green-100 text-green-800",
  PHASE_3: "bg-yellow-100 text-yellow-800",
  PHASE_4: "bg-purple-100 text-purple-800",
};

const liaStatusNames: Record<string, string> = {
  PENDING: "Väntar",
  APPROVED: "Godkänd",
  ACTIVE: "Pågående",
  COMPLETED: "Avslutad",
  REJECTED: "Avvisad",
};

export function StudentList({ students, careerGroups }: Props) {
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedPhase, setSelectedPhase] = useState<string>("all");
  const [selectedLiaStatus, setSelectedLiaStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filtrera studerande baserat på valda filter
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Sökfilter
      const matchesSearch =
        search === "" ||
        student.name?.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase());

      // Gruppfilter
      const matchesGroup =
        selectedGroup === "all" || student.careerGroup?.id === selectedGroup;

      // Fasfilter
      const matchesPhase =
        selectedPhase === "all" ||
        student.progression?.currentPhase === selectedPhase;

      // LIA-status filter
      const matchesLia =
        selectedLiaStatus === "all" ||
        (selectedLiaStatus === "has_lia" && student.liaPlacement) ||
        (selectedLiaStatus === "no_lia" && !student.liaPlacement) ||
        student.liaPlacement?.status === selectedLiaStatus;

      return matchesSearch && matchesGroup && matchesPhase && matchesLia;
    }).sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "");
          break;
        case "email":
          comparison = a.email.localeCompare(b.email);
          break;
        case "group":
          comparison = (a.careerGroup?.name || "").localeCompare(b.careerGroup?.name || "");
          break;
        case "phase":
          comparison = (a.progression?.currentPhase || "").localeCompare(b.progression?.currentPhase || "");
          break;
        case "leads":
          comparison = a.leads.length - b.leads.length;
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [students, search, selectedGroup, selectedPhase, selectedLiaStatus, sortBy, sortOrder]);

  const hasActiveFilters =
    search !== "" ||
    selectedGroup !== "all" ||
    selectedPhase !== "all" ||
    selectedLiaStatus !== "all";

  const clearFilters = () => {
    setSearch("");
    setSelectedGroup("all");
    setSelectedPhase("all");
    setSelectedLiaStatus("all");
  };

  return (
    <div className="space-y-4">
      {/* Statistik */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totalt</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Filtrerade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStudents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Har LIA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {students.filter((s) => s.liaPlacement).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Utan LIA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {students.filter((s) => !s.liaPlacement).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Rensa filter
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            {/* Sök */}
            <div className="relative flex-1 min-w-[180px] max-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Sök namn eller email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Grupp */}
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Alla grupper" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla grupper</SelectItem>
                {careerGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Fas */}
            <Select value={selectedPhase} onValueChange={setSelectedPhase}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Alla faser" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla faser</SelectItem>
                <SelectItem value="PHASE_1">FAS 1: Intro</SelectItem>
                <SelectItem value="PHASE_2">FAS 2: Nätverkande</SelectItem>
                <SelectItem value="PHASE_3">FAS 3: LIA-sök</SelectItem>
                <SelectItem value="PHASE_4">FAS 4: Jobb-sök</SelectItem>
              </SelectContent>
            </Select>

            {/* LIA-status */}
            <Select value={selectedLiaStatus} onValueChange={setSelectedLiaStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="LIA-status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla LIA-status</SelectItem>
                <SelectItem value="has_lia">Har LIA</SelectItem>
                <SelectItem value="no_lia">Saknar LIA</SelectItem>
                <SelectItem value="APPROVED">LIA Godkänd</SelectItem>
                <SelectItem value="ACTIVE">LIA Pågående</SelectItem>
                <SelectItem value="PENDING">LIA Väntar</SelectItem>
              </SelectContent>
            </Select>

            {/* Sortering */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[130px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sortera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Namn</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="group">Grupp</SelectItem>
                <SelectItem value="phase">Fas</SelectItem>
                <SelectItem value="leads">Antal leads</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              title={sortOrder === "asc" ? "Stigande" : "Fallande"}
            >
              <ArrowUpDown className={`h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabell */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead>Namn</TableHead>
                <TableHead>Grupp</TableHead>
                <TableHead>Fas</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>LIA-status</TableHead>
                <TableHead className="text-right">Åtgärder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <EmptyState
                      icon={UserX}
                      title="Inga studerande hittades"
                      description={hasActiveFilters ? "Prova att ändra eller rensa filtren" : "Det finns inga studerande i systemet ännu"}
                      action={
                        hasActiveFilters ? (
                          <button
                            onClick={clearFilters}
                            className="text-primary hover:underline text-sm"
                          >
                            Rensa filter
                          </button>
                        ) : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.name || "—"}</div>
                        <div className="text-sm text-muted-foreground">
                          {student.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {student.careerGroup?.name || "—"}
                    </TableCell>
                    <TableCell>
                      {student.progression?.currentPhase ? (
                        <Badge
                          variant="secondary"
                          className={phaseColors[student.progression.currentPhase]}
                        >
                          {phaseNames[student.progression.currentPhase]}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{student.leads.length}</TableCell>
                    <TableCell>
                      {student.liaPlacement ? (
                        <Badge variant="outline">
                          {liaStatusNames[student.liaPlacement.status] ||
                            student.liaPlacement.status}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <SlackDMDialog
                        studentName={student.name || student.email}
                        studentEmail={student.email}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
