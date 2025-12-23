"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Search, 
  Building2,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Briefcase,
  Check,
  X,
} from "lucide-react";

type CareerGroup = {
  id: string;
  name: string;
};

type Company = {
  id: string;
  name: string;
  city: string;
};

type UserInfo = {
  id: string;
  name: string | null;
  email: string;
  careerGroup: CareerGroup | null;
};

type LiaPlacement = {
  id: string;
  supervisor: string;
  supervisorEmail: string | null;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
  user: UserInfo;
  company: Company;
};

type Props = {
  liaPlacements: LiaPlacement[];
};

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Väntar", color: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Godkänd", color: "bg-green-100 text-green-800" },
  ACTIVE: { label: "Pågående", color: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Avslutad", color: "bg-gray-100 text-gray-800" },
  REJECTED: { label: "Avvisad", color: "bg-red-100 text-red-800" },
};

export function LiaOverview({ liaPlacements: initialPlacements }: Props) {
  const [placements, setPlacements] = useState(initialPlacements);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const pendingPlacements = placements.filter((p) => p.status === "PENDING");
  const approvedPlacements = placements.filter((p) => p.status === "APPROVED" || p.status === "ACTIVE");
  const completedPlacements = placements.filter((p) => p.status === "COMPLETED");

  const filteredPlacements = useMemo(() => {
    return placements.filter((placement) => {
      const matchesSearch =
        search === "" ||
        placement.user.name?.toLowerCase().includes(search.toLowerCase()) ||
        placement.user.email.toLowerCase().includes(search.toLowerCase()) ||
        placement.company.name.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || placement.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [placements, search, statusFilter]);

  const updateStatus = async (placementId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/lia/${placementId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setPlacements((prev) =>
          prev.map((p) =>
            p.id === placementId ? { ...p, status: newStatus } : p
          )
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Totalt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{placements.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <Clock className="h-4 w-4 text-yellow-600" />
              Väntar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingPlacements.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <Briefcase className="h-4 w-4 text-blue-600" />
              Aktiva
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{approvedPlacements.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-gray-600" />
              Avslutade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPlacements.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      {pendingPlacements.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Väntar på godkännande ({pendingPlacements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingPlacements.map((placement) => (
                <div
                  key={placement.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="font-medium">{placement.user.name || placement.user.email}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {placement.company.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {placement.supervisor}
                      </span>
                      {placement.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(placement.startDate).toLocaleDateString("sv-SE")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 hover:bg-green-50"
                      onClick={() => updateStatus(placement.id, "APPROVED")}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Godkänn
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => updateStatus(placement.id, "REJECTED")}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Avvisa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Sök studerande eller företag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Alla statusar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla statusar</SelectItem>
                {Object.entries(statusConfig).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Studerande</TableHead>
                <TableHead>Företag</TableHead>
                <TableHead>Handledare</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlacements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {placements.length === 0
                      ? "Inga LIA-platser registrerade ännu."
                      : "Inga LIA-platser matchar filtret."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlacements.map((placement) => (
                  <TableRow key={placement.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{placement.user.name || "—"}</div>
                        <div className="text-sm text-muted-foreground">{placement.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{placement.company.name}</div>
                          <div className="text-sm text-muted-foreground">{placement.company.city}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{placement.supervisor}</TableCell>
                    <TableCell>
                      {placement.startDate ? (
                        <div className="text-sm">
                          {new Date(placement.startDate).toLocaleDateString("sv-SE")}
                          {placement.endDate && (
                            <> — {new Date(placement.endDate).toLocaleDateString("sv-SE")}</>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={placement.status}
                        onValueChange={(value) => updateStatus(placement.id, value)}
                      >
                        <SelectTrigger className={`w-[130px] ${statusConfig[placement.status]?.color}`}>
                          <SelectValue>
                            {statusConfig[placement.status]?.label || placement.status}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, { label }]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {/* Future: Add view details button */}
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
