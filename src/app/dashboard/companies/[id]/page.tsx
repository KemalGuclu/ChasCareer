import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Building2, 
  MapPin, 
  Globe, 
  Users, 
  Briefcase,
  ArrowLeft,
  Mail,
  Phone,
} from "lucide-react";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    redirect("/dashboard");
  }

  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      contacts: true,
      liaPlacements: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      leads: {
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/companies">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tillbaka
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                {company.industry && <span>{company.industry}</span>}
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {company.city}
                </span>
                {company.size && <Badge variant="outline">{company.size}</Badge>}
              </div>
            </div>
          </div>
        </div>
        {company.website && (
          <Button variant="outline" asChild>
            <a href={company.website} target="_blank" rel="noopener noreferrer">
              <Globe className="h-4 w-4 mr-2" />
              Webbplats
            </a>
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Kontakter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Kontakter ({company.contacts.length})
            </CardTitle>
            <CardDescription>Kontaktpersoner på företaget</CardDescription>
          </CardHeader>
          <CardContent>
            {company.contacts.length === 0 ? (
              <p className="text-muted-foreground text-sm">Inga kontakter registrerade</p>
            ) : (
              <div className="space-y-3">
                {company.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3 rounded-lg border bg-muted/20"
                  >
                    <div className="font-medium">{contact.name}</div>
                    {contact.title && (
                      <div className="text-sm text-muted-foreground">{contact.title}</div>
                    )}
                    <div className="flex gap-4 mt-2 text-sm">
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </a>
                      )}
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* LIA-historik */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              LIA-historik ({company.liaPlacements.length})
            </CardTitle>
            <CardDescription>Studerande som haft LIA här</CardDescription>
          </CardHeader>
          <CardContent>
            {company.liaPlacements.length === 0 ? (
              <p className="text-muted-foreground text-sm">Inga LIA-platser registrerade</p>
            ) : (
              <div className="space-y-3">
                {company.liaPlacements.map((lia) => (
                  <div
                    key={lia.id}
                    className="p-3 rounded-lg border bg-muted/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{lia.user.name || lia.user.email}</div>
                      <Badge
                        variant={
                          lia.status === "COMPLETED"
                            ? "default"
                            : lia.status === "ACTIVE"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {lia.status === "COMPLETED"
                          ? "Avslutad"
                          : lia.status === "ACTIVE"
                          ? "Pågående"
                          : lia.status === "APPROVED"
                          ? "Godkänd"
                          : lia.status}
                      </Badge>
                    </div>
                    {lia.startDate && lia.endDate && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {new Date(lia.startDate).toLocaleDateString("sv-SE")} -{" "}
                        {new Date(lia.endDate).toLocaleDateString("sv-SE")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Aktiva Leads ({company.leads.length})</CardTitle>
          <CardDescription>Studerande som har detta företag i sin lead-lista</CardDescription>
        </CardHeader>
        <CardContent>
          {company.leads.length === 0 ? (
            <p className="text-muted-foreground text-sm">Inga aktiva leads</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {company.leads.map((lead) => (
                <Badge key={lead.id} variant="secondary">
                  {lead.user.name || "Okänd"}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
