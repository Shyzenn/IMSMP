import { NextRequest, NextResponse } from "next/server";
import { Prisma, Status } from "@prisma/client";
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

    // Determine which sources to fetch
    const fetchOrderRequests =
      !sources || sources.length === 0 || sources.includes("order_request");
    const fetchWalkIns =
      !sources || sources.length === 0 || sources.includes("walk_in");

    // Date conditions
    const orderRequestDateCondition: Prisma.OrderRequestWhereInput = {};
    const walkInDateCondition: Prisma.WalkInTransactionWhereInput = {};

    if (from || to) {
      const createdAt: Prisma.DateTimeFilter = {};
      if (from) createdAt.gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        createdAt.lte = toDate;
      }

      orderRequestDateCondition.createdAt = createdAt;
      walkInDateCondition.createdAt = createdAt;
    }

    // Status filters
    const orderRequestStatusCondition: Prisma.OrderRequestWhereInput = {};
    const walkInStatusCondition: Prisma.WalkInTransactionWhereInput = {};

    if (statuses && statuses.length > 0) {
      const validStatuses = statuses.filter((s): s is Status =>
        Object.values(Status).includes(s as Status)
      );

      if (validStatuses.length > 0) {
        orderRequestStatusCondition.status = { in: validStatuses };
        walkInStatusCondition.status = { in: validStatuses };
      }
    }

    // WHERE filters
    const requestWhere: Prisma.OrderRequestWhereInput = {
      ...(safeQuery && {
        patient: {
          patientName: { equals: safeQuery },
        },
      }),
      ...orderRequestDateCondition,
      ...orderRequestStatusCondition,
    };

    const walkInWhere: Prisma.WalkInTransactionWhereInput = {
      ...(safeQuery && { customer_name: { equals: safeQuery } }),
      ...walkInDateCondition,
      ...walkInStatusCondition,
    };

    // Fetch data
    const [requestOrders, walkInOrders] = await Promise.all([
      fetchOrderRequests
        ? db.orderRequest.findMany({
            where: requestWhere,
            include: {
              user: true,
              receivedBy: true,
              items: { include: { product: true } },
              payments: {
                select: {
                  processedBy: true,
                  discountAmount: true,
                  discountType: true,
                },
              },
              patient: {
                select: {
                  patientName: true,
                  roomNumber: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),
      fetchWalkIns
        ? db.walkInTransaction.findMany({
            where: walkInWhere,
            include: {
              items: { include: { product: true } },
              user: true,
              payments: {
                select: {
                  discountAmount: true,
                  discountType: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),
    ]);

    // Format Walk-In transactions
    const formattedWalkIn = walkInOrders.map((tx) => {
      // Calculate subtotal
      const itemsTotal = tx.items.reduce((sum, item) => {
        const netQuantity = item.quantity - (item.refundedQuantity || 0);
        return sum + (Number(item.price) || 0) * netQuantity;
      }, 0);

      // Get payment info
      const firstPayment = tx.payments?.[0];
      const isVatExempt =
        firstPayment &&
        (firstPayment.discountType === "PWD" ||
          firstPayment.discountType === "SENIOR");

      // Calculate base amount (VAT-exclusive if exempt)
      const baseAmount = isVatExempt ? itemsTotal / 1.12 : itemsTotal;

      // Sum ALL payment discounts
      const discount =
        tx.payments?.reduce(
          (sum, p) => sum + Number(p.discountAmount || 0),
          0
        ) || 0;

      // Calculate grand total
      const grandTotal = baseAmount - discount;

      return {
        id: tx.id,
        customer: tx.customer_name || "Unknown",
        type: "Walk In" as const,
        createdAt: tx.createdAt,
        status: tx.status,
        source: "Walk In" as const,
        subtotal: itemsTotal,
        discount,
        isVatExempt,
        total: grandTotal,
        handledBy: tx.user?.username || "Unknown",
        itemDetails: tx.items.map((item) => ({
          productName: item.product?.product_name ?? "Unknown",
          quantity: item.quantity - (item.refundedQuantity || 0),
          price: item.product?.price?.toNumber() ?? 0,
        })),
      };
    });

    // Format Order Request transactions
    const formattedRequest = requestOrders.map((tx) => {
      // Calculate subtotal
      const itemsTotal = tx.items.reduce((sum, item) => {
        const netQuantity =
          Number(item.quantityOrdered) - (Number(item.refundedQuantity) || 0);
        return sum + netQuantity * (item.product?.price?.toNumber() ?? 0);
      }, 0);

      // Get payment info
      const firstPayment = tx.payments?.[0];
      const isVatExempt =
        firstPayment &&
        (firstPayment.discountType === "PWD" ||
          firstPayment.discountType === "SENIOR");

      // Calculate base amount (VAT-exclusive if exempt)
      const baseAmount = isVatExempt ? itemsTotal / 1.12 : itemsTotal;

      // Sum ALL payment discounts
      const discount =
        tx.payments?.reduce(
          (sum, p) => sum + Number(p.discountAmount || 0),
          0
        ) || 0;

      // Calculate grand total
      const grandTotal = baseAmount - discount;

      return {
        id: tx.id,
        customer: tx.patient.patientName || "Unknown",
        patient_name: tx.patient.patientName,
        roomNumber: tx.patient.roomNumber
          ? Number(tx.patient.roomNumber)
          : undefined,
        type: tx.type,
        createdAt: tx.createdAt,
        status: tx.status,
        source: "Request Order" as const,
        requestedBy: tx.user?.username || "Unknown",
        receivedBy: tx.receivedBy?.username || "Unknown",
        processedBy: tx.payments.map((p) => p.processedBy),
        subtotal: itemsTotal,
        discount,
        isVatExempt,
        total: grandTotal,
        itemDetails: tx.items.map((item) => ({
          productName: item.product?.product_name ?? "Unknown",
          quantity:
            Number(item.quantityOrdered) - (Number(item.refundedQuantity) || 0),
          price: item.product?.price?.toNumber() ?? 0,
        })),
      };
    });

    // Combine and sort
    const combined = [...formattedWalkIn, ...formattedRequest];
    if (combined.length === 0) {
      return NextResponse.json(
        { error: "No transactions found" },
        { status: 404 }
      );
    }

    combined.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Calculate totals using grandTotal (after discounts and VAT)
    const totalAmount = combined.reduce((sum, tx) => sum + tx.total, 0);
    const totalDiscount = combined.reduce((sum, tx) => sum + tx.discount, 0);
    const totalSubtotal = combined.reduce((sum, tx) => sum + tx.subtotal, 0);

    const meta = {
      dateRange: { from: from || null, to: to || null },
      searchQuery: query || null,
      statusFilters: statuses || null,
      sourceFilters: sources || null,
      totalTransactions: combined.length,
      totalAmount,
      totalDiscount,
      totalSubtotal,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ transactions: combined, meta });
  } catch (error) {
    console.error("Transaction report error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
