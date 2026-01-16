import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { ITEMS_PER_PAGE } from "@/lib/utils";
import { Prisma, OrderType, Status } from "@prisma/client";
import {
  dateFilter,
  isRequestOrderFilterEnabled,
  isWalkInFilterEnabled,
  mapStatus,
  TransactionFilter,
} from "../route";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    const filter = searchParams.get("filter") || "all";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";

    const safeQuery = query.toLowerCase().trim();
    const userRole = session.user.role || "";

    // Parse multiple filters
    const selectedFilters = filter
      ?.split(",")
      .filter(Boolean)
      .map((f) => f.trim() as TransactionFilter) || ["all"];

    const statusFilters = selectedFilters
      .map((f) => mapStatus(f))
      .filter(Boolean);

    const buildRequestWhere = (): Prisma.OrderRequestWhereInput => {
      const conditions: Prisma.OrderRequestWhereInput[] = [];

      if (safeQuery) {
        conditions.push({
          patient: {
            patientName: {
              contains: safeQuery,
            },
          },
        });
      }

      if (statusFilters.length > 0) {
        const typeFilters = statusFilters.filter((sf) => sf!.field === "type");
        const statusOnlyFilters = statusFilters.filter(
          (sf) => sf!.field === "status"
        );

        if (typeFilters.length > 0) {
          conditions.push({
            type: { in: typeFilters.map((tf) => tf!.value as OrderType) },
          });
        }

        if (statusOnlyFilters.length > 0) {
          conditions.push({
            status: { in: statusOnlyFilters.map((sf) => sf!.value as Status) },
          });
        }
      }

      const dateCondition = dateFilter({ from, to });
      if (dateCondition) {
        conditions.push(dateCondition);
      }

      if (conditions.length === 0) return {};
      if (conditions.length === 1) return conditions[0];
      return { AND: conditions };
    };

    const buildWalkInWhere = (): Prisma.WalkInTransactionWhereInput => {
      const conditions: Prisma.WalkInTransactionWhereInput[] = [];

      if (safeQuery) {
        conditions.push({ customer_name: { contains: safeQuery } });
      }

      if (statusFilters.length > 0) {
        const statusOnlyFilters = statusFilters.filter(
          (sf) => sf!.field === "status"
        );

        if (statusOnlyFilters.length > 0) {
          conditions.push({
            status: { in: statusOnlyFilters.map((sf) => sf!.value as Status) },
          });
        }
      }

      const dateCondition = dateFilter({ from, to });
      if (dateCondition) {
        conditions.push(dateCondition);
      }

      if (conditions.length === 0) return {};
      if (conditions.length === 1) return conditions[0];
      return { AND: conditions };
    };

    const whereRequestOrder = buildRequestWhere();
    const whereWalkIn = buildWalkInWhere();

    const includeWalkIn = isWalkInFilterEnabled(selectedFilters);
    const includeRequest = isRequestOrderFilterEnabled(selectedFilters);

    const [walkinCount, requestCount] = await Promise.all([
      includeWalkIn && userRole !== "Nurse"
        ? db.walkInTransaction.count({ where: whereWalkIn })
        : Promise.resolve(0),
      includeRequest
        ? db.orderRequest.count({ where: whereRequestOrder })
        : Promise.resolve(0),
    ]);

    const total = walkinCount + requestCount;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    return NextResponse.json(
      { totalPages, totalTransaction: total },
      { status: 200 }
    );
  } catch (error) {
    console.error("Transaction pages API error:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch transaction pages",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
