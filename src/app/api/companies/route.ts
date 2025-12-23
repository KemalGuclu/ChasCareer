import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - hämta alla företag
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companies = await prisma.company.findMany({
      include: {
        contacts: true,
        liaPlacements: {
          select: { id: true, status: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

// POST - skapa nytt företag
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      name, industry, city, size, website, description,
      contactName, contactTitle, contactEmail, contactPhone 
    } = await request.json();

    if (!name || !city) {
      return NextResponse.json(
        { error: "name and city are required" },
        { status: 400 }
      );
    }

    // Admin/Teacher skapar godkända företag direkt
    // Studenter föreslår företag som väntar på godkännande
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "TEACHER";

    const company = await prisma.company.create({
      data: {
        name,
        industry: industry || null,
        city,
        size: size || null,
        website: website || null,
        description: description || null,
        status: isAdmin ? "APPROVED" : "PENDING",
        suggestedById: isAdmin ? null : session.user.id,
        // Skapa kontakt om namn angetts
        ...(contactName ? {
          contacts: {
            create: {
              name: contactName,
              title: contactTitle || null,
              email: contactEmail || null,
              phone: contactPhone || null,
            },
          },
        } : {}),
      },
      include: {
        contacts: true,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}
