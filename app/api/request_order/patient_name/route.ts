import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q")?.toLowerCase().trim() || "";

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const patientRecords = await db.orderRequest.findMany({
      where: {
        patient: {
          patientName: {
            contains: query,
          },
        },
      },
      select: {
        patient: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    // Use a Map to ensure distinct patient names
    const distinctPatients = new Map<string, number>();
    for (const p of patientRecords) {
      if (
        p.patient.patientName &&
        !distinctPatients.has(p.patient.patientName)
      ) {
        distinctPatients.set(
          p.patient.patientName,
          Number(p.patient.roomNumber)
        );
      }
    }

    const results = Array.from(distinctPatients.entries()).map(
      ([patientName, roomNumber]) => ({
        patientName,
        roomNumber,
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
