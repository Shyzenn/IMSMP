import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const search = searchParams.get("search");
    const actions = searchParams.get("actions");
    const entityTypes = searchParams.get("entityTypes");

    // Build where clause
    const where: Prisma.AuditLogWhereInput = {};

    // Date range filter
    if (from || to) {
      where.createdAt = {};
      if (from) {
        where.createdAt.gte = new Date(from);
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    // Search filter (searches in description)
    if (search) {
      where.description = {
        contains: search,
      };
    }

    // Action filters
    if (actions) {
      const actionArray = actions.split(",");
      where.action = {
        in: actionArray,
      };
    }

    // Entity type filters
    if (entityTypes) {
      const entityArray = entityTypes.split(",");
      where.entityType = {
        in: entityArray,
      };
    }

    const logs = await db.auditLog.findMany({
      where,
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Generate metadata for the report
    const meta = {
      dateRange: {
        from: from,
        to: to,
      },
      searchQuery: search,
      actionFilters: actions ? actions.split(",") : null,
      entityTypeFilters: entityTypes ? entityTypes.split(",") : null,
      totalLogs: logs.length,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ logs, meta });
  } catch (error) {
    console.error("Audit export failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}