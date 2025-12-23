import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// PATCH - uppdatera LIA-plats (admin)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Endast admin/teacher kan uppdatera andras LIA-platser
    if (session.user.role !== "ADMIN" && session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const updates = await request.json();

    const liaPlacement = await prisma.liaPlacement.update({
      where: { id },
      data: updates,
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

// DELETE - ta bort LIA-plats (admin)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Endast admin kan ta bort
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.liaPlacement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting LIA:", error);
    return NextResponse.json(
      { error: "Failed to delete LIA" },
      { status: 500 }
    );
  }
}
