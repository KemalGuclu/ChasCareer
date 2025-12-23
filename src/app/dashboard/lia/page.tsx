import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LiaRegistration } from "./lia-registration";

export default async function LiaPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Hämta användarens LIA-plats om den finns
  const liaPlacement = await prisma.liaPlacement.findUnique({
    where: { userId: session.user.id },
    include: {
      company: true,
    },
  });

  // Hämta alla godkända företag för val
  const companies = await prisma.company.findMany({
    where: { status: "APPROVED" },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Min LIA-plats</h1>
        <p className="text-muted-foreground">
          Registrera och hantera din LIA-plats
        </p>
      </div>

      <LiaRegistration 
        liaPlacement={liaPlacement}
        companies={companies}
        userId={session.user.id}
      />
    </div>
  );
}
