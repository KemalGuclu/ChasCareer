import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase() || "";

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "TEACHER";

  try {
    const results: Array<{
      id: string;
      type: "student" | "company" | "lead";
      title: string;
      subtitle?: string;
      href: string;
    }> = [];

    // Sök företag (alla kan se)
    const companies = await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { city: { contains: query, mode: "insensitive" } },
          { industry: { contains: query, mode: "insensitive" } },
        ],
        status: "APPROVED",
      },
      take: 5,
      select: { id: true, name: true, city: true, industry: true },
    });

    companies.forEach((c) => {
      results.push({
        id: c.id,
        type: "company",
        title: c.name,
        subtitle: `${c.industry || ""} • ${c.city}`,
        href: `/dashboard/companies/${c.id}`,
      });
    });

    // Sök studerande (endast admin/teacher)
    if (isAdmin) {
      const students = await prisma.user.findMany({
        where: {
          role: "STUDENT",
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
        include: { careerGroup: true },
      });

      students.forEach((s) => {
        results.push({
          id: s.id,
          type: "student",
          title: s.name || s.email,
          subtitle: s.careerGroup?.name || "Ingen grupp",
          href: `/dashboard/students?search=${encodeURIComponent(s.email)}`,
        });
      });
    }

    // Sök leads (studentens egna eller admin ser alla)
    const leadsWhere = isAdmin
      ? {
          company: {
            name: { contains: query, mode: "insensitive" as const },
          },
        }
      : {
          userId: session.user.id,
          company: {
            name: { contains: query, mode: "insensitive" as const },
          },
        };

    const leads = await prisma.lead.findMany({
      where: leadsWhere,
      take: 5,
      include: { company: true },
    });

    leads.forEach((l) => {
      results.push({
        id: l.id,
        type: "lead",
        title: l.company.name,
        subtitle: `Lead - ${l.status}`,
        href: `/dashboard/leads?search=${encodeURIComponent(l.company.name)}`,
      });
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
