import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - hämta användarens LIA-plats
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const liaPlacement = await prisma.liaPlacement.findUnique({
      where: { userId: session.user.id },
      include: { company: true },
    });

    return NextResponse.json(liaPlacement);
  } catch (error) {
    console.error("Error fetching LIA:", error);
    return NextResponse.json(
      { error: "Failed to fetch LIA" },
      { status: 500 }
    );
  }
}

// POST - skapa ny LIA-plats
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, supervisor, supervisorEmail, startDate, endDate } = await request.json();

    if (!companyId || !supervisor) {
      return NextResponse.json(
        { error: "companyId and supervisor are required" },
        { status: 400 }
      );
    }

    // Kontrollera om användaren redan har en LIA-plats
    const existing = await prisma.liaPlacement.findUnique({
      where: { userId: session.user.id },
    });

    if (existing) {
      return NextResponse.json(
        { error: "LIA placement already exists" },
        { status: 409 }
      );
    }

    const liaPlacement = await prisma.liaPlacement.create({
      data: {
        userId: session.user.id,
        companyId,
        supervisor,
        supervisorEmail: supervisorEmail || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: "PENDING",
      },
    });

    return NextResponse.json(liaPlacement, { status: 201 });
  } catch (error) {
    console.error("Error creating LIA:", error);
    return NextResponse.json(
      { error: "Failed to create LIA" },
      { status: 500 }
    );
  }
}

// PATCH - uppdatera LIA-plats
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, supervisor, supervisorEmail, startDate, endDate } = await request.json();

    const liaPlacement = await prisma.liaPlacement.update({
      where: { userId: session.user.id },
      data: {
        ...(companyId && { companyId }),
        ...(supervisor && { supervisor }),
        supervisorEmail: supervisorEmail || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json(liaPlacement);
  } catch (error) {
    console.error("Error updating LIA:", error);
    return NextResponse.json(
      { error: "Failed to update LIA" },
      { status: 500 }
    );
  }
}
