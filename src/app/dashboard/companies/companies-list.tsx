"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  Users,
  Briefcase,
  MapPin,
  ExternalLink,
  Check,
  X,
  Clock,
} from "lucide-react";

type Contact = {
  id: string;
  name: string;
  title: string | null;
  email: string | null;
};

type LiaPlacement = {
  id: string;
  status: string;
};

type Company = {
  id: string;
  name: string;
  industry: string | null;
  city: string;
  size: string | null;
  website: string | null;
  description: string | null;
  status: string;
  contacts: Contact[];
  liaPlacements: LiaPlacement[];
  leads: { id: string }[];
};

type Props = {
  companies: Company[];
  pendingCompanies: Company[];
};

export function CompaniesList({ companies: initialCompanies, pendingCompanies: initialPending }: Props) {
  const router = useRouter();
  const [companies, setCompanies] = useState(initialCompanies);
  const [pendingCompanies, setPendingCompanies] = useState(initialPending);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newCompany, setNewCompany] = useState({
    name: "",
    industry: "",
    city: "",
    size: "",
    website: "",
    description: "",
    // Kontaktperson
    contactName: "",
    contactTitle: "",
    contactEmail: "",
    contactPhone: "",
  });

  const cities = useMemo(() => 
    [...new Set(companies.map((c) => c.city))].sort(),
    [companies]
  );
  
  const industries = useMemo(() => 
    [...new Set(companies.map((c) => c.industry).filter(Boolean))].sort() as string[],
    [companies]
  );

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch =
        search === "" ||
        company.name.toLowerCase().includes(search.toLowerCase()) ||
        company.industry?.toLowerCase().includes(search.toLowerCase());

      const matchesCity = cityFilter === "all" || company.city === cityFilter;
      const matchesIndustry = industryFilter === "all" || company.industry === industryFilter;

      return matchesSearch && matchesCity && matchesIndustry;
    });
  }, [companies, search, cityFilter, industryFilter]);

  const addCompany = async () => {
    if (!newCompany.name || !newCompany.city) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCompany),
      });

      if (res.ok) {
        const company = await res.json();
        setCompanies((prev) => [
          { ...company, contacts: [], liaPlacements: [], leads: [] },
          ...prev,
        ]);
        setIsAddDialogOpen(false);
        setNewCompany({ name: "", industry: "", city: "", size: "", website: "", description: "", contactName: "", contactTitle: "", contactEmail: "", contactPhone: "" });
      }
    } catch (error) {
      console.error("Failed to add company:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const approveCompany = async (companyId: string) => {
    try {
      const res = await fetch(`/api/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });

      if (res.ok) {
        const approved = pendingCompanies.find((c) => c.id === companyId);
        if (approved) {
          setPendingCompanies((prev) => prev.filter((c) => c.id !== companyId));
          setCompanies((prev) => [{ ...approved, status: "APPROVED" }, ...prev]);
        }
      }
    } catch (error) {
      console.error("Failed to approve company:", error);
    }
  };

  const rejectCompany = async (companyId: string) => {
    try {
      await fetch(`/api/companies/${companyId}`, { method: "DELETE" });
      setPendingCompanies((prev) => prev.filter((c) => c.id !== companyId));
    } catch (error) {
      console.error("Failed to reject company:", error);
    }
  };

  const totalCompanies = companies.length;
  const companiesWithLia = companies.filter((c) => c.liaPlacements.length > 0).length;
  const totalContacts = companies.reduce((sum, c) => sum + c.contacts.length, 0);

  return (
    <div className="space-y-4">
      {/* Pending Approvals */}
      {pendingCompanies.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Väntande godkännande ({pendingCompanies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingCompanies.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div>
                    <div className="font-medium">{company.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {company.industry} • {company.city}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 hover:bg-green-50"
                      onClick={() => approveCompany(company.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Godkänn
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => rejectCompany(company.id)}
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Totalt företag</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompanies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Har haft LIA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{companiesWithLia}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Kontakter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Städer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cities.length}</div>
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
                placeholder="Sök företag eller bransch..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Alla städer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla städer</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Alla branscher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla branscher</SelectItem>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Lägg till företag
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Lägg till nytt företag</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Företagsnamn *</Label>
                    <Input
                      value={newCompany.name}
                      onChange={(e) => setNewCompany((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Ex: Spotify"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Stad *</Label>
                      <Input
                        value={newCompany.city}
                        onChange={(e) => setNewCompany((p) => ({ ...p, city: e.target.value }))}
                        placeholder="Ex: Stockholm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bransch</Label>
                      <Input
                        value={newCompany.industry}
                        onChange={(e) => setNewCompany((p) => ({ ...p, industry: e.target.value }))}
                        placeholder="Ex: Tech"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Storlek</Label>
                      <Select 
                        value={newCompany.size} 
                        onValueChange={(v) => setNewCompany((p) => ({ ...p, size: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Välj storlek" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10</SelectItem>
                          <SelectItem value="11-50">11-50</SelectItem>
                          <SelectItem value="51-200">51-200</SelectItem>
                          <SelectItem value="200+">200+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Webbplats</Label>
                      <Input
                        value={newCompany.website}
                        onChange={(e) => setNewCompany((p) => ({ ...p, website: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  
                  {/* Kontaktperson */}
                  <div className="border-t pt-4 mt-4">
                    <Label className="mb-2 block font-medium">Kontaktperson (valfritt)</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Namn</Label>
                        <Input
                          value={newCompany.contactName}
                          onChange={(e) => setNewCompany((p) => ({ ...p, contactName: e.target.value }))}
                          placeholder="Ex: Anna Andersson"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Titel</Label>
                        <Input
                          value={newCompany.contactTitle}
                          onChange={(e) => setNewCompany((p) => ({ ...p, contactTitle: e.target.value }))}
                          placeholder="Ex: CTO"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="space-y-2">
                        <Label className="text-xs">Email</Label>
                        <Input
                          value={newCompany.contactEmail}
                          onChange={(e) => setNewCompany((p) => ({ ...p, contactEmail: e.target.value }))}
                          placeholder="anna@foretag.se"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Telefon</Label>
                        <Input
                          value={newCompany.contactPhone}
                          onChange={(e) => setNewCompany((p) => ({ ...p, contactPhone: e.target.value }))}
                          placeholder="070-123 45 67"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Avbryt
                  </Button>
                  <Button 
                    onClick={addCompany} 
                    disabled={!newCompany.name || !newCompany.city || isSubmitting}
                  >
                    {isSubmitting ? "Lägger till..." : "Lägg till"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>Företag</TableHead>
                <TableHead>Bransch</TableHead>
                <TableHead>Stad</TableHead>
                <TableHead>Storlek</TableHead>
                <TableHead>Kontakter</TableHead>
                <TableHead>LIA</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    {companies.length === 0
                      ? "Inga företag ännu. Lägg till det första!"
                      : "Inga företag matchar filtret."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company) => (
                  <TableRow 
                    key={company.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/dashboard/companies/${company.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{company.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{company.industry || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {company.city}
                      </div>
                    </TableCell>
                    <TableCell>
                      {company.size ? (
                        <Badge variant="outline">{company.size}</Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {company.contacts.length}
                      </div>
                    </TableCell>
                    <TableCell>
                      {company.liaPlacements.length > 0 ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {company.liaPlacements.length}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {company.website && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(company.website!, "_blank");
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
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
