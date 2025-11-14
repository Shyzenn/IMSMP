import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { startOfDay, endOfDay } from "date-fns";
import { Prisma } from "@prisma/client";

export type Body = {
  from?: string | null;
  to?: string | null;
  type?: string;
};

export interface ReportItem {
  productId: number;
  productName: string;
  category: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ReportSale {
  id: number;
  type: "Order Request" | "Walk-In";
  createdAt: Date;
  user: {
    id: string | number;
    name: string;
  } | null;
  items: ReportItem[];
}

export interface SalesFilterMeta {
  from?: string | null;
  to?: string | null;
  type?: string;
}

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();
    const type = (body.type || "all").toLowerCase();

    // Parse dates as local dates
    let from: Date | null = null;
    let to: Date | null = null;

    if (body.from) {
      const [year, month, day] = body.from.split('-').map(Number);
      from = new Date(year, month - 1, day);
    }
    if (body.to) {
      const [year, month, day] = body.to.split('-').map(Number);
      to = new Date(year, month - 1, day);
    }

    // Build date filter
    let createdAtFilter: { gte?: Date; lte?: Date } | undefined = undefined;
    if (from && to) {
      createdAtFilter = { gte: startOfDay(from), lte: endOfDay(to) };
    } else if (from) {
      createdAtFilter = { gte: startOfDay(from) };
    } else if (to) {
      createdAtFilter = { lte: endOfDay(to) };
    }

    const results: ReportSale[] = [];

    // === ORDER REQUEST SALES ===
    if (type === "all" || type === "orderrequest") {
      const whereReq: Prisma.OrderRequestWhereInput = {
        status: { in: ["paid", "refunded"] }
      };
      if (createdAtFilter) whereReq.createdAt = createdAtFilter;

      const orders = await db.orderRequest.findMany({
        where: whereReq,
        include: {
          items: {
            include: {
              product: {
                include: { category: true }
              }
            }
          },
          user: true,
        },
        orderBy: { createdAt: "asc" },
      });


      orders.forEach((order) => {
        const items = order.items.map((item) => {
          const productName = item.product?.product_name ?? "Unknown";
          const categoryName = item.product?.category?.name ?? "Uncategorized";
          const productPrice = item.product?.price ? Number(item.product.price) : 0;
          
          const netQuantity = item.quantity - (item.refundedQuantity || 0);
          const total = productPrice * netQuantity;

          return {
            productId: item.productId,
            productName,
            category: categoryName,
            quantity: netQuantity,
            price: productPrice,
            total,
          };
        });

        results.push({
          id: order.id,
          type: "Order Request",
          createdAt: order.createdAt,
          user: order.user
            ? {
                id: order.user.id,
                name: order.user.username || order.user.email,
              }
            : null,
          items,
        });
      });

    }

    // === WALK-IN SALES ===
    if (type === "all" || type === "walkin") {
      const whereWalkin: Prisma.WalkInTransactionWhereInput = {
        status: { in: ["paid", "refunded"] },
      };
      if (createdAtFilter) whereWalkin.createdAt = createdAtFilter;

      const walkins = await db.walkInTransaction.findMany({
        where: whereWalkin,
        include: {
          items: {
            include: {
              product: {
                include: { category: true }
              }
            }
          },
          user: true,
        },
        orderBy: { createdAt: "asc" },
      });


      walkins.forEach((txn) => {
        const items = txn.items.map((item) => {
          const productName = item.product?.product_name ?? "Unknown";
          const categoryName = item.product?.category?.name ?? "Uncategorized";
          
          const productPrice = item.price ? Number(item.price) : 0;
          
          const netQuantity = item.quantity - (item.refundedQuantity || 0);
          const total = productPrice * netQuantity;

          return {
            productId: item.productId,
            productName,
            category: categoryName,
            quantity: netQuantity,
            price: productPrice,
            total,
          };
        });

        results.push({
          id: txn.id,
          type: "Walk-In",
          createdAt: txn.createdAt,
          user: txn.user
            ? {
                id: txn.user.id,
                name: txn.user.username || txn.user.email,
              }
            : null,
          items,
        });
      });

    }


    if (results.length === 0) {
      return NextResponse.json({ message: "No data found" }, { status: 404 });
    }

    return NextResponse.json({
      sales: results,
      meta: {
        from: body.from ?? null,
        to: body.to ?? null,
        type,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Sales report error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales report" },
      { status: 500 }
    );
  }
}