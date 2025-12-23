import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CompaniesList } from "./companies-list";

export default async function CompaniesPage() {
  const session = await auth();
  
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    redirect("/dashboard");
  }

  // Hämta alla företag med kontakter och antal LIA-platser
  const companies = await prisma.company.findMany({
    include: {
      contacts: true,
      liaPlacements: {
        select: { id: true, status: true },
      },
      leads: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Separera godkända och väntande
  const approvedCompanies = companies.filter((c) => c.status === "APPROVED");
  const pendingCompanies = companies.filter((c) => c.status === "PENDING");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Företagsdatabas</h1>
        <p className="text-muted-foreground">
          Hantera företag, kontakter och se LIA-historik
        </p>
      </div>

      <CompaniesList 
        companies={approvedCompanies} 
        pendingCompanies={pendingCompanies}
      />
    </div>
  );
}
