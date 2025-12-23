import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LiaOverview } from "./lia-overview";

export default async function LiaManagementPage() {
  const session = await auth();
  
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    redirect("/dashboard");
  }

  // Hämta alla LIA-platser
  const liaPlacements = await prisma.liaPlacement.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          careerGroup: true,
        },
      },
      company: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">LIA-platser</h1>
        <p className="text-muted-foreground">
          Hantera och godkänn studerandes LIA-platser
        </p>
      </div>

      <LiaOverview liaPlacements={liaPlacements} />
    </div>
  );
}
