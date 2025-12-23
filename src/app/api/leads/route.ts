import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - hämta alla leads för användaren
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leads = await prisma.lead.findMany({
      where: { userId: session.user.id },
      include: {
        company: true,
        contact: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

// POST - skapa nytt lead
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, contactId } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );
    }

    // Kolla om lead redan finns för detta företag
    const existingLead = await prisma.lead.findFirst({
      where: {
        userId: session.user.id,
        companyId: companyId,
      },
    });

    if (existingLead) {
      return NextResponse.json(
        { error: "Lead already exists for this company" },
        { status: 409 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        userId: session.user.id,
        companyId,
        contactId: contactId || null,
        status: "NEW",
      },
      include: {
        company: true,
        contact: true,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
