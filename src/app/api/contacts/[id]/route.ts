import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/contacts/[id] - Uppdatera kontakt
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, title, email, phone } = body;

  const contact = await prisma.contact.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(title !== undefined && { title }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
    },
  });

  return NextResponse.json(contact);
}

// DELETE /api/contacts/[id] - Ta bort kontakt
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.contact.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
