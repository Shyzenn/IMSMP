import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma, OrderType, Status } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

type TransactionFilter =
  | "all"
  | "regular"
  | "emergency"
  | "pending"
  | "for_payment"
  | "paid"
  | "canceled"
  | "refunded";

type StatusFilter = {
  field: "type" | "status";
  value: OrderType | Status;
};

type OrderRequestWithRelations = Prisma.OrderRequestGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: {
            category: true;
            batches: true;
          };
        };
      };
    };
    user: { select: { username: true } };
    processedBy: { select: { username: true } };
  };
}>;

interface OrderItemWithProduct {
  quantity: number;
  product: {
    price: Decimal | number;
    product_name: string;
    category?: { name: string } | null;
  };
}

type WalkInTransactionWithRelations = Prisma.WalkInTransactionGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: { category: true };
        };
      };
    };
    user: { select: { username: true } };
  };
}>;

export interface TransactionItem {
  productName: string;
  category: string;
  quantity: number;
  price: number;
  total: number;
}

const mapStatus = (filter: TransactionFilter): StatusFilter | null => {
  switch (filter) {
    case "regular":
      return { field: "type", value: "REGULAR" };
    case "emergency":
      return { field: "type", value: "EMERGENCY" };
    case "pending":
      return { field: "status", value: "pending" };
    case "for_payment":
      return { field: "status", value: "for_payment" };
    case "paid":
      return { field: "status", value: "paid" };
    case "canceled":
      return { field: "status", value: "canceled" };
    case "refunded":
      return { field: "status", value: "refunded" };
    default:
      return null;
  }
};

const isWalkInFilterEnabled = (filters: TransactionFilter[]): boolean => {
  if (filters.includes("all")) return true;
  // Walk-in doesn't have "regular" or "emergency" types
  const hasTypeFilter = filters.some(f => ["regular", "emergency"].includes(f));
  if (hasTypeFilter) return false;
  return true;
};

const isRequestOrderFilterEnabled = (filters: TransactionFilter[]): boolean => {
  if (filters.includes("all")) return true;
  return true; // Always include unless explicitly filtered out
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all"; // all, orderrequest, walkin
    const filterParam = searchParams.get("filter") || "all";
    const query = searchParams.get("query") || "";

    // Parse multiple filters (comma-separated)
    const selectedFilters = filterParam
      .split(",")
      .filter(Boolean)
      .map((f) => f.trim() as TransactionFilter);

    const statusFilters = selectedFilters
      .map((f) => mapStatus(f))
      .filter(Boolean) as StatusFilter[];

    let orderRequests: OrderRequestWithRelations[] = [];
    let walkInTransactions: WalkInTransactionWithRelations[] = [];

    // Determine if we should fetch each type
    const includeWalkIn = type === "all" || type === "walkin";
    const includeRequest = type === "all" || type === "orderrequest";

    // === BUILD ORDER REQUEST WHERE CLAUSE ===
    const buildRequestWhere = (): Prisma.OrderRequestWhereInput => {
      const conditions: Prisma.OrderRequestWhereInput[] = [];

      // Search filter
      if (query) {
        conditions.push({
          OR: [
            { patient_name: { contains: query, mode: "insensitive" } },
            { room_number: { contains: query, mode: "insensitive" } },
            { id: !isNaN(Number(query)) ? Number(query) : undefined },
          ].filter(
            (condition) =>
              condition.id !== undefined ||
              condition.patient_name ||
              condition.room_number
          ),
        });
      }

      // Status filters
      if (statusFilters.length > 0) {
        const typeFilters = statusFilters.filter((sf) => sf.field === "type");
        const statusOnlyFilters = statusFilters.filter(
          (sf) => sf.field === "status"
        );

        if (typeFilters.length > 0) {
          conditions.push({
            type: { in: typeFilters.map((tf) => tf.value as OrderType) },
          });
        }

        if (statusOnlyFilters.length > 0) {
          conditions.push({
            status: { in: statusOnlyFilters.map((sf) => sf.value as Status) },
          });
        }
      }

      // Always exclude archived
      conditions.push({ isArchived: false });

      if (conditions.length === 0) {
        return { isArchived: false };
      }

      if (conditions.length === 1) {
        return conditions[0];
      }

      return { AND: conditions };
    };

    // === BUILD WALK-IN WHERE CLAUSE ===
    const buildWalkInWhere = (): Prisma.WalkInTransactionWhereInput => {
      const conditions: Prisma.WalkInTransactionWhereInput[] = [];

      // Search filter
      if (query) {
        conditions.push({
          OR: [
            { customer_name: { contains: query, mode: "insensitive" } },
            { id: !isNaN(Number(query)) ? Number(query) : undefined },
          ].filter(
            (condition) => condition.id !== undefined || condition.customer_name
          ),
        });
      }

      // Status filters (only status, not type for walk-ins)
      if (statusFilters.length > 0) {
        const statusOnlyFilters = statusFilters.filter(
          (sf) => sf.field === "status"
        );

        if (statusOnlyFilters.length > 0) {
          conditions.push({
            status: { in: statusOnlyFilters.map((sf) => sf.value as Status) },
          });
        }
      }

      if (conditions.length === 0) {
        return {};
      }

      if (conditions.length === 1) {
        return conditions[0];
      }

      return { AND: conditions };
    };

    // === FETCH ORDER REQUESTS ===
    if (includeRequest && isRequestOrderFilterEnabled(selectedFilters)) {
      const whereOrder = buildRequestWhere();

      orderRequests = await db.orderRequest.findMany({
        where: whereOrder,
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                  batches: {
                    where: {
                      type: {
                        notIn: ["EXPIRED", "CONSUMED", "ARCHIVED"],
                      },
                      quantity: {
                        gt: 0,
                      },
                    },
                    orderBy: {
                      expiryDate: "asc",
                    },
                    take: 1,
                  },
                },
              },
            },
          },
          user: {
            select: {
              username: true,
            },
          },
          processedBy: {
            select: {
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    // === FETCH WALK-IN TRANSACTIONS ===
    if (includeWalkIn && isWalkInFilterEnabled(selectedFilters)) {
      const whereWalkIn = buildWalkInWhere();

      walkInTransactions = await db.walkInTransaction.findMany({
        where: whereWalkIn,
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
          user: {
            select: {
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    // Transform data for PDF
    const transactions = [
      ...orderRequests.map((order) => {
        // Calculate total from items - price comes from Product, not batch
        const itemsWithPrices = order.items.map((item: OrderItemWithProduct) => {
          // Price is stored in the Product table
          const price = item.product.price 
            ? (typeof item.product.price === 'object' && 'toNumber' in item.product.price
              ? item.product.price.toNumber()
              : Number(item.product.price))
            : 0;
          
          return {
            productName: item.product?.product_name || "Unknown",
            category: item.product?.category?.name || "Uncategorized",
            quantity: item.quantity,
            price: price,
            total: price * item.quantity,
          };
        });

        const orderTotal = itemsWithPrices.reduce(
          (sum, item) => sum + item.total,
          0
        );

        return {
          id: order.id,
          type: "Order Request",
          orderType: order.type,
          status: order.status,
          patient_name: order.patient_name || "-",
          room_number: order.room_number || "-",
          requestedBy: order.user.username || "-",
          processedBy: order.processedBy || "-",
          createdAt: order.createdAt,
          totalAmount: orderTotal,
          items: itemsWithPrices,
        };
      }),
      ...walkInTransactions.map((txn) => ({
        id: txn.id,
        type: "Walk-In",
        orderType: null,
        status: txn.status,
        customer_name: txn.customer_name || "Walk-In Customer",
        encodedBy: txn.user.username || "-",
        createdAt: txn.createdAt,
        totalAmount:  Number(txn.totalAmount),
        items: txn.items.map((item): TransactionItem => ({
            productName: item.product?.product_name ?? "Unknown",
            category: item.product?.category?.name ?? "Uncategorized",
            quantity: item.quantity,
            price: Number(item.product?.price ?? 0),
            total: Number(item.product?.price ?? 0) * item.quantity
            })),
      })),
    ];

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: "No transactions found with current filters" },
        { status: 404 }
      );
    }

    // Calculate totals
    const grandTotal = transactions.reduce((sum, txn) => {
      const txnTotal = txn.items.reduce(
        (itemSum: number, item: TransactionItem ) => itemSum +  Number(item.price) * item.quantity ,
        0
      );
      return sum + txnTotal;
    }, 0);

    // Format filter display
    const filterDisplay =
      selectedFilters.length === 1 && selectedFilters[0] === "all"
        ? "All"
        : selectedFilters
            .map((f) => {
              switch (f) {
                case "regular":
                  return "Regular";
                case "emergency":
                  return "Pay Later";
                case "pending":
                  return "Pending";
                case "for_payment":
                  return "For Payment";
                case "paid":
                  return "Paid";
                case "canceled":
                  return "Canceled";
                case "refunded":
                  return "Refunded";
                default:
                  return f;
              }
            })
            .join(", ");

    return NextResponse.json({
      transactions,
      meta: {
        type,
        filter: filterParam,
        filterDisplay,
        query,
        counts: {
          orderRequests: orderRequests.length,
          walkInTransactions: walkInTransactions.length,
          total: transactions.length,
        },
        grandTotal,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions for export:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch transactions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}