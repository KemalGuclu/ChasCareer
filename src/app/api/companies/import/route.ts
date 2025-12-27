import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV must have header and at least one row" }, { status: 400 });
    }

    // Parse header
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
    
    // Expected columns: name, city, industry, size, website, description
    const nameIndex = header.findIndex((h) => h === "name" || h === "namn" || h === "företag");
    const cityIndex = header.findIndex((h) => h === "city" || h === "stad" || h === "ort");
    const industryIndex = header.findIndex((h) => h === "industry" || h === "bransch");
    const sizeIndex = header.findIndex((h) => h === "size" || h === "storlek");
    const websiteIndex = header.findIndex((h) => h === "website" || h === "webbplats" || h === "hemsida");
    const descriptionIndex = header.findIndex((h) => h === "description" || h === "beskrivning");

    if (nameIndex === -1) {
      return NextResponse.json({ 
        error: "CSV must have a 'name' column (or 'namn', 'företag')" 
      }, { status: 400 });
    }

    if (cityIndex === -1) {
      return NextResponse.json({ 
        error: "CSV must have a 'city' column (or 'stad', 'ort')" 
      }, { status: 400 });
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      const name = values[nameIndex]?.trim();
      const city = values[cityIndex]?.trim();
      
      if (!name || !city) {
        results.skipped++;
        results.errors.push(`Rad ${i + 1}: Saknar namn eller stad`);
        continue;
      }

      // Check if company already exists
      const exists = await prisma.company.findFirst({
        where: { 
          name: { equals: name, mode: "insensitive" },
          city: { equals: city, mode: "insensitive" },
        },
      });

      if (exists) {
        results.skipped++;
        results.errors.push(`Rad ${i + 1}: ${name} i ${city} finns redan`);
        continue;
      }

      await prisma.company.create({
        data: {
          name,
          city,
          industry: industryIndex !== -1 ? values[industryIndex]?.trim() || null : null,
          size: sizeIndex !== -1 ? values[sizeIndex]?.trim() || null : null,
          website: websiteIndex !== -1 ? values[websiteIndex]?.trim() || null : null,
          description: descriptionIndex !== -1 ? values[descriptionIndex]?.trim() || null : null,
          status: "APPROVED",
        },
      });

      results.imported++;
    }

    return NextResponse.json({
      success: true,
      imported: results.imported,
      skipped: results.skipped,
      errors: results.errors.slice(0, 10), // Limit errors shown
    });
  } catch (error) {
    console.error("CSV import error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}

// Parse CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
