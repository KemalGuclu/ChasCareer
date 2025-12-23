"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { 
  Building2, 
  Calendar,
  User,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
  Briefcase,
} from "lucide-react";

type Company = {
  id: string;
  name: string;
  city: string;
};

type LiaPlacement = {
  id: string;
  supervisor: string;
  supervisorEmail: string | null;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
  company: Company;
};

type Props = {
  liaPlacement: LiaPlacement | null;
  companies: Company[];
  userId: string;
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  PENDING: { label: "Väntar på godkännande", icon: <Clock className="h-4 w-4" />, color: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Godkänd", icon: <CheckCircle2 className="h-4 w-4" />, color: "bg-green-100 text-green-800" },
  ACTIVE: { label: "Pågående", icon: <Briefcase className="h-4 w-4" />, color: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Avslutad", icon: <CheckCircle2 className="h-4 w-4" />, color: "bg-gray-100 text-gray-800" },
  REJECTED: { label: "Avvisad", icon: <XCircle className="h-4 w-4" />, color: "bg-red-100 text-red-800" },
};

export function LiaRegistration({ liaPlacement, companies, userId }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLia, setCurrentLia] = useState(liaPlacement);
  
  const [formData, setFormData] = useState({
    companyId: liaPlacement?.company.id || "",
    supervisor: liaPlacement?.supervisor || "",
    supervisorEmail: liaPlacement?.supervisorEmail || "",
    startDate: liaPlacement?.startDate ? new Date(liaPlacement.startDate).toISOString().split("T")[0] : "",
    endDate: liaPlacement?.endDate ? new Date(liaPlacement.endDate).toISOString().split("T")[0] : "",
  });

  const handleSubmit = async () => {
    if (!formData.companyId || !formData.supervisor) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/lia", {
        method: currentLia ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        const company = companies.find((c) => c.id === formData.companyId);
        setCurrentLia({ ...data, company });
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to save LIA:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentLia) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Ingen LIA-plats registrerad</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            När du har hittat en LIA-plats, registrera den här så att utbildaren kan godkänna den.
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Building2 className="h-4 w-4 mr-2" />
                Registrera LIA-plats
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrera LIA-plats</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Företag *</Label>
                  <Select 
                    value={formData.companyId} 
                    onValueChange={(v) => setFormData((p) => ({ ...p, companyId: v }))}
                  >
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
                <div className="space-y-2">
                  <Label>Handledare *</Label>
                  <Input
                    value={formData.supervisor}
                    onChange={(e) => setFormData((p) => ({ ...p, supervisor: e.target.value }))}
                    placeholder="Namn på din handledare"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Handledarens email</Label>
                  <Input
                    type="email"
                    value={formData.supervisorEmail}
                    onChange={(e) => setFormData((p) => ({ ...p, supervisorEmail: e.target.value }))}
                    placeholder="handledare@foretag.se"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Startdatum</Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slutdatum</Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Avbryt
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!formData.companyId || !formData.supervisor || isSubmitting}
                >
                  {isSubmitting ? "Sparar..." : "Registrera"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  const status = statusConfig[currentLia.status] || statusConfig.PENDING;

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Din LIA-plats
            </CardTitle>
            <Badge className={status.color}>
              {status.icon}
              <span className="ml-1">{status.label}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">{currentLia.company.name}</div>
                  <div className="text-sm text-muted-foreground">{currentLia.company.city}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">{currentLia.supervisor}</div>
                  <div className="text-sm text-muted-foreground">Handledare</div>
                </div>
              </div>
              {currentLia.supervisorEmail && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <a href={`mailto:${currentLia.supervisorEmail}`} className="text-primary hover:underline">
                      {currentLia.supervisorEmail}
                    </a>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {(currentLia.startDate || currentLia.endDate) && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Period</div>
                    <div className="text-sm text-muted-foreground">
                      {currentLia.startDate && new Date(currentLia.startDate).toLocaleDateString("sv-SE")}
                      {currentLia.startDate && currentLia.endDate && " — "}
                      {currentLia.endDate && new Date(currentLia.endDate).toLocaleDateString("sv-SE")}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info about status */}
      {currentLia.status === "PENDING" && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800">
              Din LIA-plats väntar på godkännande från utbildaren. Du får en notifikation när den är godkänd.
            </p>
          </CardContent>
        </Card>
      )}

      {currentLia.status === "REJECTED" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800">
              Din LIA-plats har avvisats. Kontakta din utbildare för mer information.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
