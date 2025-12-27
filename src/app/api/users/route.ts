import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/users - Hämta alla användare (admin only)
export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  return NextResponse.json(users);
}

// POST /api/users - Skapa ny användare (admin only)
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { email, name, role, careerGroupId } = body;

  if (!email || !name || !role) {
    return NextResponse.json(
      { error: "Email, namn och roll krävs" },
      { status: 400 }
    );
  }

  // Kolla om användaren redan finns
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "En användare med denna email finns redan" },
      { status: 400 }
    );
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      role,
      careerGroupId: careerGroupId || null,
    },
    include: {
      careerGroup: {
        include: {
          education: true,
        },
      },
    },
  });

  return NextResponse.json(user, { status: 201 });
}
