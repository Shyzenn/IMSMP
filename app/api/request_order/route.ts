import { addRequestOrderSchema } from "@/lib/types";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = addRequestOrderSchema.safeParse(body);

    if (!result.success) {
      const zodErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        zodErrors[field] = issue.message;
      });
      return NextResponse.json({ errors: zodErrors }, { status: 400 });
    }

    const { room_number, patient_name, status, products } = result.data;

    const newOrder = await db.orderRequest.create({
      data: {
        room_number,
        patient_name,
        status,
        items: {
          create: products.map((product) => ({
            quantity: product.quantity,
            product: {
              connect: {
                product_name: product.productId,
              },
            },
          })),
        },
      },
    });
    console.log("Order successfully created:", newOrder);
    return NextResponse.json({ success: true, orderId: newOrder.id });
  } catch (error) {
  console.error("Full error object:", error);
  if (error instanceof Error) {
    return NextResponse.json(
      { message: "Failed to create request order", error: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json(
    { message: "An unknown error occurred" },
    { status: 500 }
  );
}
}

export async function GET() {
  try {
   const orders = await db.orderRequest.findMany({
  include: {
    items: {
      include: {
        product: true,
      },
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
});

const formattedOrders = orders.map(order => ({
  ...order,
  items: order.items.map(item => ({
    ...item,
    product: {
      ...item.product,
      productName: item.product.product_name 
    }
  }))
}));

return NextResponse.json(formattedOrders, { status: 200 });

  } catch (error) {
    console.error("Error fetching order requests:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch order requests",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
