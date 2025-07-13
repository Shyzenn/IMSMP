import { addRequestOrderSchema } from "@/lib/types";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import formatStatus, { capitalLetter } from "@/lib/utils";
import { auth } from "@/auth";
import { NotificationType } from "@prisma/client";
import { sendNotification } from "@/server";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
    }

    const userId = session.user.id; 

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
        userId,
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

    // 🛎️ Send notification to the Manager(s)
    const pharmacists = await db.user.findMany({
      where: {role: "Pharmacist_Staff"}
    })

    const notifications = pharmacists.map((pharmacist) => ({
      title: "New order request",
      message: JSON.stringify({
        patientName: patient_name,
        roomNumber: room_number,
        submittedBy: session.user.username,
        role: session.user.role
      }),
      type: NotificationType.ORDER_REQUEST,
      senderId: session.user.id,
      recipientId: pharmacist.id,
      orderId: newOrder.id
    }))

    await db.notification.createMany({data: notifications})

    for (const notification of notifications) {
    sendNotification(notification.recipientId, {
      title: notification.title,
      message: notification.message,
      type: notification.type,
    });
  }
    
    console.log("Order and notifications successfully created:", newOrder);

    return NextResponse.json({ success: true, orderId: newOrder.id });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in POST /api/request_order:", error.message);
      return NextResponse.json(
        { message: "Failed to create request order", error: error.message },
        { status: 500 }
      );
    } else {
      console.error("Unknown error:", error);
      return NextResponse.json(
        { message: "An unknown error occurred" },
        { status: 500 }
      );
    }
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
      take:50
    });

    const formattedOrders = orders.map((order) => { 
      const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
      
      const customId = `ORD-${order.id.toString().padStart(4, '0')}`

      return {
        id: customId,
        patient_name: `${order.patient_name ? capitalLetter(order.patient_name) : 'Unknown'}`,
        roomNumber: `${order.room_number ? capitalLetter(order.room_number) : 'Unknown'}`,
        createdAt: order.createdAt,
        status: formatStatus(order.status),
        items: `${totalItems} item${totalItems !== 1 ? 's' : ''}`, 
        itemDetails: order.items.map((item) => ({
          productName: item.product.product_name,
          quantity: item.quantity,
          price:item.product.price
        }))
      };  
    });

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