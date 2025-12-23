import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LeadsList } from "./leads-list";

export default async function LeadsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Hämta användarens leads med företag och kontakt
  const leads = await prisma.lead.findMany({
    where: { userId: session.user.id },
    include: {
      company: true,
      contact: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  // Hämta alla företag för "Lägg till lead"-dialogen
  const companies = await prisma.company.findMany({
    include: { contacts: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mina Leads</h1>
        <p className="text-muted-foreground">
          Hantera dina företagskontakter och spåra din progress
        </p>
      </div>

      <LeadsList 
        leads={leads} 
        companies={companies}
        userId={session.user.id}
      />
    </div>
  );
}
