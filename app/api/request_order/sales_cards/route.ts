import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { startOfDay, endOfDay } from "date-fns";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();

    // Fetch all paid orders
    const [paidOrderRequest, paidWalkIn] = await Promise.all([
      db.orderRequest.findMany({
        where: { status: { in: ["paid", "refunded"] } },
        include: {
          items: {
            include: { product: true },
          },
          payments: {
            select: {
              discountAmount: true,
              discountType: true,
            },
          },
        },
      }),
      db.walkInTransaction.findMany({
        where: { status: { in: ["paid", "refunded"] } },
        include: {
          items: {
            include: { product: true },
          },
          payments: {
            select: {
              discountAmount: true,
              discountType: true,
            },
          },
        },
      }),
    ]);

    // Calculate total revenue for Order Requests
    const orderRequesttotalRevenue = paidOrderRequest.reduce((acc, order) => {
      const orderTotal = order.items.reduce((sum, item) => {
        const netQuantity =
          item.quantityOrdered.toNumber() -
          (item.refundedQuantity.toNumber() || 0);
        return sum + (Number(item.product.price) || 0) * netQuantity;
      }, 0);

      // Check if this order has VAT exemption (PWD/Senior discount)
      const payment = order.payments?.[0];
      const isVatExempt =
        payment &&
        (payment.discountType === "PWD" || payment.discountType === "SENIOR");

      // Calculate the base amount (VAT-exclusive if exempt)
      const baseAmount = isVatExempt ? orderTotal / 1.12 : orderTotal;

      // Subtract discount
      const paymentDiscount = order.payments?.reduce(
        (sum, p) => sum + Number(p.discountAmount || 0),
        0
      );

      return acc + (baseAmount - (paymentDiscount || 0));
    }, 0);

    // Calculate total revenue for Walk-In transactions
    const walkInttotalRevenue = paidWalkIn.reduce((acc, transaction) => {
      const transactionTotal = transaction.items.reduce((sum, item) => {
        const netQuantity = item.quantity - (item.refundedQuantity || 0);
        return sum + (Number(item.price) || 0) * netQuantity;
      }, 0);

      // Check if this transaction has VAT exemption
      const payment = transaction.payments?.[0];
      const isVatExempt =
        payment &&
        (payment.discountType === "PWD" || payment.discountType === "SENIOR");

      // Calculate the base amount (VAT-exclusive if exempt)
      const baseAmount = isVatExempt
        ? transactionTotal / 1.12
        : transactionTotal;

      const paymentDiscount = transaction.payments?.reduce(
        (sum, p) => sum + Number(p.discountAmount || 0),
        0
      );

      return acc + (baseAmount - (paymentDiscount || 0));
    }, 0);

    const totalRevenue = orderRequesttotalRevenue + walkInttotalRevenue;

    // Fetch all orders made today
    const [orderRequestordersToday, walkInordersToday] = await Promise.all([
      db.orderRequest.findMany({
        where: {
          createdAt: {
            gte: startOfDay(today),
            lte: endOfDay(today),
          },
          status: "paid",
        },
        include: {
          items: {
            include: { product: true },
          },
          payments: {
            select: {
              discountAmount: true,
              discountPercent: true,
              discountType: true,
            },
          },
        },
      }),

      db.walkInTransaction.findMany({
        where: {
          createdAt: {
            gte: startOfDay(today),
            lte: endOfDay(today),
          },
          status: "paid",
        },
        include: {
          items: {
            include: { product: true },
          },
          payments: {
            select: {
              discountAmount: true,
              discountPercent: true,
              discountType: true,
            },
          },
        },
      }),
    ]);

    // Calculate total sales today for Order Requests
    const OrderRequesttotalSalesToday = orderRequestordersToday.reduce(
      (acc, order) => {
        const orderTotal = order.items.reduce((sum, item) => {
          return (
            sum +
            (Number(item.product.price) || 0) * item.quantityOrdered.toNumber()
          );
        }, 0);

        // Check if this order has VAT exemption (PWD/Senior discount)
        const payment = order.payments?.[0];
        const isVatExempt =
          payment &&
          (payment.discountType === "PWD" || payment.discountType === "SENIOR");

        // Calculate the base amount (VAT-exclusive if exempt)
        const baseAmount = isVatExempt ? orderTotal / 1.12 : orderTotal;

        const paymentDiscount = order.payments?.reduce(
          (sum, p) => sum + Number(p.discountAmount || 0),
          0
        );

        return acc + (baseAmount - (paymentDiscount || 0));
      },
      0
    );

    // Calculate total sales today for Walk-In transactions
    const walkIntotalSalesToday = walkInordersToday.reduce((acc, order) => {
      const orderTotal = order.items.reduce((sum, item) => {
        return sum + (Number(item.price) || 0) * item.quantity;
      }, 0);

      // Check if this transaction has VAT exemption
      const payment = order.payments?.[0];
      const isVatExempt =
        payment &&
        (payment.discountType === "PWD" || payment.discountType === "SENIOR");

      // Calculate the base amount (VAT-exclusive if exempt)
      const baseAmount = isVatExempt ? orderTotal / 1.12 : orderTotal;

      const paymentDiscount = order.payments?.reduce(
        (sum, p) => sum + Number(p.discountAmount || 0),
        0
      );

      return acc + (baseAmount - (paymentDiscount || 0));
    }, 0);

    const totalSalesToday = OrderRequesttotalSalesToday + walkIntotalSalesToday;

    // Count all orders
    const [orderRequesttotalOrders, walkIntotalOrders] = await Promise.all([
      db.orderRequest.count(),
      db.walkInTransaction.count(),
    ]);

    const totalOrders = orderRequesttotalOrders + walkIntotalOrders;

    // Count all pending payment
    const forPayment = await db.orderRequest.count({
      where: { status: "for_payment" },
    });

    return NextResponse.json(
      {
        totalRevenue,
        totalSalesToday,
        totalOrders,
        forPayment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching cards data", error);
    return NextResponse.json(
      {
        message: "Failed to fetch cards data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
