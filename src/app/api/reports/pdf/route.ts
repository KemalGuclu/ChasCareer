import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import ReactPDF from "@react-pdf/renderer";
import { StudentReport, GroupReport } from "./pdf-templates";

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const studentId = url.searchParams.get("studentId");
    const groupId = url.searchParams.get("groupId");

    if (type === "student" && studentId) {
      const student = await prisma.user.findUnique({
        where: { id: studentId },
        include: {
          careerGroup: { include: { education: true } },
          progression: {
            include: {
              milestones: { include: { milestone: true } },
            },
          },
          leads: { include: { company: true } },
          liaPlacement: { include: { company: true } },
        },
      });

      if (!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }

      const pdfStream = await ReactPDF.renderToStream(
        StudentReport({ student })
      );

      return new Response(pdfStream as unknown as ReadableStream, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="rapport_${student.name || student.email}.pdf"`,
        },
      });
    }

    if (type === "group" && groupId) {
      const group = await prisma.careerGroup.findUnique({
        where: { id: groupId },
        include: {
          education: true,
          members: {
            where: { role: "STUDENT" },
            include: {
              progression: {
                include: {
                  milestones: { include: { milestone: true } },
                },
              },
              leads: true,
              liaPlacement: true,
            },
          },
        },
      });

      if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
      }

      const pdfStream = await ReactPDF.renderToStream(
        GroupReport({ group })
      );

      return new Response(pdfStream as unknown as ReadableStream, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="grupprapport_${group.name}.pdf"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
