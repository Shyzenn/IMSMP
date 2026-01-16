import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { ITEMS_PER_PAGE } from "@/lib/utils";
import { Prisma, OrderType, Status } from "@prisma/client";
import { OrderView } from "@/lib/interfaces";

export type TransactionFilter =
  | "all"
  | "pending"
  | "for_payment"
  | "paid"
  | "canceled"
  | "refunded"
  | "regular"
  | "emergency"
  | "walk_in";

export const mapStatus = (filter: TransactionFilter) => {
  const mapping: Record<
    TransactionFilter,
    { field: string; value: string } | null
  > = {
    all: null,
    pending: { field: "status", value: "pending" },
    for_payment: { field: "status", value: "for_payment" },
    paid: { field: "status", value: "paid" },
    canceled: { field: "status", value: "canceled" },
    refunded: { field: "status", value: "refunded" },
    regular: { field: "type", value: "REGULAR" },
    emergency: { field: "type", value: "EMERGENCY" },
    walk_in: { field: "source", value: "walk_in" },
  };
  return mapping[filter];
};

export const isWalkInFilterEnabled = (filters: TransactionFilter[]) => {
  if (filters.includes("all")) return true;
  if (filters.includes("walk_in")) return true;
  const statusFilters = [
    "pending",
    "for_payment",
    "paid",
    "canceled",
    "refunded",
  ];
  return filters.some((f) => statusFilters.includes(f));
};

export const isRequestOrderFilterEnabled = (filters: TransactionFilter[]) => {
  if (filters.includes("all")) return true;
  if (filters.includes("regular") || filters.includes("emergency")) return true;
  const statusFilters = [
    "pending",
    "for_payment",
    "paid",
    "canceled",
    "refunded",
  ];
  return filters.some((f) => statusFilters.includes(f));
};

export const dateFilter = (dateRange: { from: string; to: string }) => {
  if (!dateRange.from && !dateRange.to) return null;

  const conditions: { gte?: Date; lte?: Date } = {};
  if (dateRange.from) {
    conditions.gte = new Date(dateRange.from);
  }
  if (dateRange.to) {
    const toDate = new Date(dateRange.to);
    toDate.setHours(23, 59, 59, 999);
    conditions.lte = toDate;
  }

  return { createdAt: conditions };
};

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    const currentPage = Number(searchParams.get("page")) || 1;
    const filter = searchParams.get("filter") || "all";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";

    const skip = (currentPage - 1) * ITEMS_PER_PAGE;
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

    // Build where clauses
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

    const validSortFields = ["customer", "createdAt", "quantity", "total"];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const safeSortByRequest =
      sortBy === "customer_name" ? "patient_name" : safeSortBy;
    const safeSortByWalkIn =
      sortBy === "customer_name" ? "customer_name" : safeSortBy;
    const dbSortableFields = ["createdAt", "customer_name"];
    const isDbSortable = dbSortableFields.includes(sortBy);

    const [requestOrders, walkinOrders] = await Promise.all([
      includeRequest
        ? db.orderRequest.findMany({
            where: whereRequestOrder,
            include: {
              user: true,
              receivedBy: true,
              dispensedBy: true,
              preparedBy: true,
              items: { include: { product: true } },
              payments: {
                select: {
                  processedBy: true,
                  createdAt: true,
                  amountDue: true,
                  discountAmount: true,
                  discountType: true,
                  discountPercent: true,
                },
              },
              patient: {
                select: {
                  patientName: true,
                  roomNumber: true,
                },
              },
            },
            orderBy: isDbSortable
              ? { [safeSortByRequest]: sortOrder }
              : { createdAt: "desc" },
          })
        : Promise.resolve([]),
      includeWalkIn && userRole !== "Nurse"
        ? db.walkInTransaction.findMany({
            where: whereWalkIn,
            include: {
              items: { include: { product: true } },
              payments: {
                select: {
                  processedBy: true,
                  createdAt: true,
                  amountDue: true,
                  discountAmount: true,
                  discountType: true,
                  discountPercent: true,
                },
              },
            },
            orderBy: isDbSortable
              ? { [safeSortByWalkIn]: sortOrder }
              : { createdAt: "desc" },
          })
        : Promise.resolve([]),
    ]);

    const formattedWalkIn: OrderView[] = walkinOrders.map((tx) => {
      const items = tx.items ?? [];

      return {
        id: tx.id,
        customer: tx.customer_name?.trim() || "Unknown",
        type: "Walk In",
        handledBy: "Unknown",
        createdAt: tx.createdAt,
        status: tx.status,
        source: "Walk In",
        quantity: items.reduce((sum, item) => sum + item.quantity, 0),
        price: items.reduce((sum, item) => sum + item.price.toNumber(), 0),
        paymentDetails: tx.payments.map((payment) => ({
          processedBy: { username: payment.processedBy.username },
          processedAt: payment.createdAt,
          amountDue: Number(payment.amountDue),
          discountAmount: Number(payment.discountAmount),
          discountType: payment.discountType,
          discountPercent: Number(payment.discountPercent),
        })),
        itemDetails: items.map((item) => ({
          productName: item.product?.product_name ?? "Unknown",
          strength: item.product.strength ?? "",
          dosageForm: item.product.dosageForm ?? "",
          quantityOrdered: item.quantity,
          price: item.product?.price?.toNumber?.() ?? 0,
        })),
      };
    });

    const formattedRequest: OrderView[] = requestOrders.map((tx) => {
      const items = tx.items ?? [];

      return {
        id: tx.id,
        requestedBy: tx.user?.username
          ? tx.user.username.charAt(0).toUpperCase() + tx.user.username.slice(1)
          : "Unknown",
        receivedBy: tx.receivedBy?.username
          ? tx.receivedBy.username.charAt(0).toUpperCase() +
            tx.receivedBy.username.slice(1)
          : "Unknown",
        preparedBy: tx.preparedBy?.username
          ? tx.preparedBy.username.charAt(0).toUpperCase() +
            tx.preparedBy.username.slice(1)
          : "Unknown",
        dispensedBy: tx.dispensedBy?.username
          ? tx.dispensedBy.username.charAt(0).toUpperCase() +
            tx.dispensedBy.username.slice(1)
          : "Unknown",
        preparedAt: tx.preparedAt ? new Date(tx.preparedAt) : undefined,
        dispensedAt: tx.dispensedAt ? new Date(tx.dispensedAt) : undefined,
        remarks: tx.remarks,
        paymentDetails: tx.payments.map((payment) => ({
          processedBy: { username: payment.processedBy.username },
          processedAt: payment.createdAt,
          amountDue: Number(payment.amountDue),
          discountAmount: Number(payment.discountAmount),
          discountType: payment.discountType,
          discountPercent: Number(payment.discountPercent),
        })),
        patientDetails: tx.patient
          ? {
              patientName: tx.patient.patientName,
              roomNumber: tx.patient.roomNumber ?? undefined,
            }
          : {
              patientName: "Unknown",
              roomNumber: undefined,
            },
        type: tx.type,
        createdAt: tx.createdAt,
        status: tx.status,
        source: "Request Order",
        quantity: items.reduce(
          (sum, item) => sum + item.quantityOrdered.toNumber(),
          0
        ),
        price: items.reduce(
          (sum, item) => sum + (item.product?.price?.toNumber?.() ?? 0),
          0
        ),
        total: items.reduce(
          (sum, item) =>
            sum +
            item.quantityOrdered.toNumber() *
              (item.product?.price?.toNumber?.() ?? 0),
          0
        ),
        itemDetails: items.map((item) => ({
          productName: item.product?.product_name ?? "Unknown",
          strength: item.product.strength ?? "",
          dosageForm: item.product.dosageForm ?? "",
          quantityOrdered: item.quantityOrdered.toNumber(),
          price: item.product?.price?.toNumber?.() ?? 0,
        })),
      };
    });

    // Merge into unified list
    const combined: OrderView[] = [...formattedWalkIn, ...formattedRequest];

    const sorted = combined.sort((a, b) => {
      let fieldA: string | number | Date | undefined;
      let fieldB: string | number | Date | undefined;

      switch (sortBy) {
        case "customer_name":
          fieldA = a.customer?.toLowerCase();
          fieldB = b.customer?.toLowerCase();
          break;
        case "createdAt":
          fieldA = a.createdAt;
          fieldB = b.createdAt;
          break;
        case "quantity":
          fieldA = a.quantity;
          fieldB = b.quantity;
          break;
        case "amountDue":
          fieldA = a.paymentDetails?.[0]?.amountDue;
          fieldB = b.paymentDetails?.[0]?.amountDue;
          break;
        default:
          fieldA = a.createdAt;
          fieldB = b.createdAt;
      }

      if (fieldA === undefined && fieldB === undefined) return 0;
      if (fieldA === undefined) return sortOrder === "asc" ? 1 : -1;
      if (fieldB === undefined) return sortOrder === "asc" ? -1 : 1;

      if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    const paginatedTransactions = sorted.slice(skip, skip + ITEMS_PER_PAGE);
    const totalTransactions = sorted.length;

    return NextResponse.json({
      data: paginatedTransactions,
      meta: {
        totalTransaction: totalTransactions,
        totalPages: Math.ceil(totalTransactions / ITEMS_PER_PAGE),
        currentPage,
      },
    });
  } catch (error) {
    console.error("Transaction API error:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch transactions",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
