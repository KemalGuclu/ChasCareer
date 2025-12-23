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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Search, 
  Building2,
  Phone,
  Mail,
  ArrowUpRight,
} from "lucide-react";

type Contact = {
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
};

type Company = {
  id: string;
  name: string;
  industry: string | null;
  city: string;
  contacts: Contact[];
};

type Lead = {
  id: string;
  status: string;
  contactAttempts: number;
  lastContactAt: Date | null;
  notes: string | null;
  company: Company;
  contact: Contact | null;
};

type Props = {
  leads: Lead[];
  companies: Company[];
  userId: string;
};

const statusConfig: Record<string, { label: string; color: string }> = {
  NEW: { label: "Nytt", color: "bg-gray-100 text-gray-800" },
  CONTACTED: { label: "Kontaktad", color: "bg-blue-100 text-blue-800" },
  IN_DIALOG: { label: "I dialog", color: "bg-yellow-100 text-yellow-800" },
  MEETING_BOOKED: { label: "Möte bokat", color: "bg-purple-100 text-purple-800" },
  VISITED: { label: "Besökt", color: "bg-indigo-100 text-indigo-800" },
  LIA_OFFERED: { label: "LIA erbjuden", color: "bg-green-100 text-green-800" },
  CLOSED_WON: { label: "Lyckad!", color: "bg-green-500 text-white" },
  CLOSED_LOST: { label: "Avslutad", color: "bg-red-100 text-red-800" },
};

export function LeadsList({ leads: initialLeads, companies, userId }: Props) {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedContact, setSelectedContact] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCompanyData = companies.find((c) => c.id === selectedCompany);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        search === "" ||
        lead.company.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.contact?.name.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  const addLead = async () => {
    if (!selectedCompany) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: selectedCompany,
          contactId: selectedContact || null,
        }),
      });

      if (res.ok) {
        const newLead = await res.json();
        // Add company and contact data to the new lead
        const company = companies.find((c) => c.id === selectedCompany);
        const contact = company?.contacts.find((c) => c.id === selectedContact);
        setLeads((prev) => [
          { ...newLead, company, contact: contact || null },
          ...prev,
        ]);
        setIsAddDialogOpen(false);
        setSelectedCompany("");
        setSelectedContact("");
      }
    } catch (error) {
      console.error("Failed to add lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      );
    } catch (error) {
      console.error("Failed to update lead:", error);
    }
  };

  // Stats
  const totalLeads = leads.length;
  const contactedLeads = leads.filter((l) => l.status !== "NEW").length;
  const inDialogLeads = leads.filter((l) => 
    ["IN_DIALOG", "MEETING_BOOKED", "VISITED", "LIA_OFFERED"].includes(l.status)
  ).length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Totalt leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">Mål: 90 leads</p>
            <div className="h-1 bg-secondary mt-2 rounded-full">
              <div 
                className="h-1 bg-primary rounded-full" 
                style={{ width: `${Math.min((totalLeads / 90) * 100, 100)}%` }} 
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Kontaktade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactedLeads}</div>
            <p className="text-xs text-muted-foreground">
              {totalLeads > 0 ? Math.round((contactedLeads / totalLeads) * 100) : 0}% av alla
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">I dialog</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{inDialogLeads}</div>
            <p className="text-xs text-muted-foreground">Pågående konversationer</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mål</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Kontakter att nå</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Sök företag eller kontakt..."
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
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Lägg till lead
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Lägg till nytt lead</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Företag</Label>
                    <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                      <SelectTrigger>
                        <SelectValue placeholder="Välj företag" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name} ({company.city})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedCompanyData && selectedCompanyData.contacts.length > 0 && (
                    <div className="space-y-2">
                      <Label>Kontaktperson (valfritt)</Label>
                      <Select value={selectedContact} onValueChange={setSelectedContact}>
                        <SelectTrigger>
                          <SelectValue placeholder="Välj kontakt" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedCompanyData.contacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.name} - {contact.title || "Ingen titel"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Avbryt
                  </Button>
                  <Button onClick={addLead} disabled={!selectedCompany || isSubmitting}>
                    {isSubmitting ? "Lägger till..." : "Lägg till"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Företag</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Försök</TableHead>
                <TableHead>Åtgärd</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {leads.length === 0
                      ? "Inga leads ännu. Lägg till ditt första lead!"
                      : "Inga leads matchar filtret."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{lead.company.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {lead.company.industry} • {lead.company.city}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.contact ? (
                        <div>
                          <div className="font-medium">{lead.contact.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            {lead.contact.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {lead.contact.email}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={lead.status}
                        onValueChange={(value) => updateLeadStatus(lead.id, value)}
                      >
                        <SelectTrigger className="w-[150px]">
                          <Badge
                            variant="secondary"
                            className={statusConfig[lead.status]?.color}
                          >
                            {statusConfig[lead.status]?.label || lead.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, { label }]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{lead.contactAttempts}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
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
