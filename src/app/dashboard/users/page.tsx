import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UsersList } from "./users-list";

export default async function UsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    include: {
      careerGroup: {
        include: {
          education: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const careerGroups = await prisma.careerGroup.findMany({
    include: {
      education: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Användare</h1>
        <p className="text-muted-foreground">
          Hantera användare och deras roller
        </p>
      </div>

      <UsersList users={users} careerGroups={careerGroups} />
    </div>
  );
}
