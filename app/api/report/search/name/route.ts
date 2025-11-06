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

    // Search in both OrderRequest and WalkInTransaction
    const [patientNames, customerNames] = await Promise.all([
      db.orderRequest.findMany({
        where: {
          patient_name: {
            contains: query,
          },
        },
        select: {
          patient_name: true,
        },
        distinct: ['patient_name'],
        take: 10,
      }),
      db.walkInTransaction.findMany({
        where: {
          customer_name: {
            contains: query,
          },
        },
        select: {
          customer_name: true,
        },
        distinct: ['customer_name'],
        take: 10,
      }),
    ]);

    // Combine and deduplicate results
    const combinedNames = new Set<string>();
    
    patientNames.forEach(p => {
      if (p.patient_name) combinedNames.add(p.patient_name);
    });
    
    customerNames.forEach(c => {
      if (c.customer_name) combinedNames.add(c.customer_name);
    });

    const results = Array.from(combinedNames)
      .sort()
      .slice(0, 10);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}