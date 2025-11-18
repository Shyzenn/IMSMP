import { NextRequest, NextResponse } from "next/server";
import { Prisma, MedTechStatus, MedTechRemarks } from "@prisma/client";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export type TransactionReportBody = {
  from?: string;
  to?: string;
  query?: string;
  statuses?: string[];
  sources?: string[];
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: TransactionReportBody = await req.json();
    const { from, to, query, statuses, sources } = body;

    const safeQuery = query?.toLowerCase().trim() || "";

    // --- Date conditions for MedTechRequest ---
    const medTechDateCondition: Prisma.MedTechRequestWhereInput = {};

    if (from || to) {
      const createdAt: Prisma.DateTimeFilter = {};
      if (from) createdAt.gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        createdAt.lte = toDate;
      }
      medTechDateCondition.createdAt = createdAt;
    }

    // --- Status and Remarks filters ---
    const medTechStatusCondition: Prisma.MedTechRequestWhereInput = {};

    if (statuses && statuses.length > 0) {
      // Separate statuses into MedTechStatus and MedTechRemarks
      const validMedTechStatuses = statuses.filter((s): s is MedTechStatus =>
        Object.values(MedTechStatus).includes(s as MedTechStatus)
      );

      const validMedTechRemarks = statuses.filter((s): s is MedTechRemarks =>
        Object.values(MedTechRemarks).includes(s as MedTechRemarks)
      );

      // Apply filters
      if (validMedTechStatuses.length > 0) {
        medTechStatusCondition.status = { in: validMedTechStatuses };
      }

      if (validMedTechRemarks.length > 0) {
        medTechStatusCondition.remarks = { in: validMedTechRemarks };
      }
    }

    // --- WHERE filter for MedTechRequest ---
    const medTechWhere: Prisma.MedTechRequestWhereInput = {
      ...medTechDateCondition,
      ...medTechStatusCondition,
      // Search by MedTech request ID only
      ...(safeQuery && {
        id: parseInt(safeQuery) || undefined,
      }),
    };

    // --- Fetch MedTech Requests ---
    const medTechRequests = await db.medTechRequest.findMany({
      where: medTechWhere,
      include: {
        requestedBy: true,
        receivedBy: true,
        approvedBy: true,
        items: { 
          include: { 
            product: true 
          } 
        },
        orderRequests: {
          select: {
            id: true,
            patient_name: true,
            room_number: true,
            type: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    // --- Check if data exists ---
    if (medTechRequests.length === 0) {
      return NextResponse.json({ error: "No transactions found" }, { status: 404 });
    }

    // --- Format data ---
    const formattedMedTech = medTechRequests.map((tx) => ({
      id: tx.id,
      type: "MedTech Request" as const,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
      status: tx.status,
      remarks: tx.remarks,
      notes: tx.notes || "N/A",
      source: "MedTech Request" as const,
      
      // Personnel
      requestedBy: tx.requestedBy?.username || "Unknown",
      receivedBy: tx.receivedBy?.username || "N/A",
      receivedAt: tx.receivedAt || null,
      approvedBy: tx.approvedBy?.username || "N/A",
      approvedAt: tx.approvedAt || null,
      
      // Related order requests
      relatedOrders: tx.orderRequests.map(order => ({
        id: order.id,
        patientName: order.patient_name,
        roomNumber: order.room_number,
        type: order.type,
      })),
      
      // Items and total calculation
      itemDetails: tx.items.map((item) => ({
        productName: item.product?.product_name ?? "Unknown",
        quantity: item.quantity,
        price: item.product?.price?.toNumber() ?? 0,
      })),
      
      total: tx.items.reduce(
        (sum, item) => sum + item.quantity * (item.product?.price?.toNumber() ?? 0),
        0
      ),
    }));

    // --- Sort by creation date ---
    formattedMedTech.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const meta = {
      dateRange: { from: from || null, to: to || null },
      searchQuery: query || null,
      statusFilters: statuses || null,
      sourceFilters: sources || null,
      totalTransactions: formattedMedTech.length,
      totalAmount: formattedMedTech.reduce((sum, tx) => sum + tx.total, 0),
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ transactions: formattedMedTech, meta });
  } catch (error) {
    console.error("MedTech transaction report error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}