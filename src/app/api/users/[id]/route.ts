import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/users/[id] - Uppdatera användare (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, role, careerGroupId } = body;

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(role && { role }),
      careerGroupId: careerGroupId === "" ? null : careerGroupId,
    },
    include: {
      careerGroup: {
        include: {
          education: true,
        },
      },
    },
  });

  return NextResponse.json(user);
}

// DELETE /api/users/[id] - Ta bort användare (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Förhindra att admin tar bort sig själv
  if (id === session.user.id) {
    return NextResponse.json(
      { error: "Du kan inte ta bort dig själv" },
      { status: 400 }
    );
  }

  await prisma.user.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
