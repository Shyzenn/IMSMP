import { addMedTechRequestSchema } from "@/lib/types";
import { db } from "@/lib/db";
import {  NextResponse } from "next/server";
import { auth } from "@/auth";
import { MedTechStatus, NotificationType, Prisma } from "@prisma/client";
import { pusherServer } from "@/lib/pusher/server";
import { toTitleCase } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const result = addMedTechRequestSchema.safeParse(body);

    if (!result.success) {
      const zodErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        zodErrors[field] = issue.message;
      });
      return NextResponse.json({ errors: zodErrors }, { status: 400 });
    }

    const { products, notes } = result.data;

    
    const newRequest  = await db.medTechRequest.create({
      data: {
        requestedById: userId,
        status: "pending_for_approval",
        remarks: "processing",
        notes,
        items: {
          create: products.map((product) => ({
            quantity: product.quantity,
            product: {
              connect: { product_name: product.productId },
            },
          })),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    // Send notification to the Pharmacist Staff
    const pharmacists = await db.user.findMany({
      where: { role: "Pharmacist_Staff" }
    });

    for (const pharmacist of pharmacists) {
     const notification = await db.notification.create({
        data: {
          title: "New request for medtech",
          type: NotificationType.MEDTECH_REQUEST,
          senderId: session.user.id,
          recipientId: pharmacist.id,
          medTechRequestId: newRequest.id,
          submittedBy: session.user.username,
          role: session.user.role,
        },
        include: { sender: true },
      });

      await pusherServer.trigger(
        `private-user-${pharmacist.id}`,
        "new-notification",
        {
          id: notification.id,
          title: notification.title,
          createdAt: notification.createdAt,
          type: notification.type,
          notes: newRequest.notes || "",
          read: false,
          sender: {
            username: notification.sender.username,
            role: notification.sender.role,
          },
          submittedBy: notification.submittedBy,
          role: notification.role,
          medTechRequestId: newRequest.id,
          order: {
            id: newRequest.id,
            products: newRequest.items.map((item) => ({
              productName: item.product.product_name,
              quantity: item.quantity,
            })), 
          },
        }
      );
    }

    // Send notification to the Manager
    const managers = await db.user.findMany({
      where: { role: "Manager" }
    });

    for (const manager of managers) {
      const notification = await db.notification.create({
        data: {
          title: "New request for medtech",
          type: NotificationType.MEDTECH_REQUEST,
          senderId: session.user.id,
          recipientId: manager.id,
          medTechRequestId: newRequest.id,
          submittedBy: session.user.username,
          role: session.user.role,
        },
        include: { sender: true },
      });

      await pusherServer.trigger(
        `private-user-${manager.id}`,
        "new-notification",
        {
          id: notification.id,
          title: notification.title,
          createdAt: notification.createdAt,
          type: notification.type,
          notes: newRequest .notes || "",
          read: false,
          sender: {
            username: notification.sender.username,
            role: notification.sender.role,
          },
          submittedBy: notification.submittedBy,
          role: notification.role,
          medTechRequestId: newRequest.id,
          order: {
            id: newRequest.id,
            products: newRequest.items.map((item) => ({
              productName: item.product.product_name,
              quantity: item.quantity,
            })), 
          },
        }
      );
    }
    
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "Requested",
        entityType: "MedTechRequest",
        entityId: newRequest.id,
        description: `User ${session.user.username} (${session.user.role}) created a request with ${products.length} item(s).`,
      },
    });

    console.log("MedTech request and notifications successfully created:", newRequest);

    return NextResponse.json({ success: true, orderId: newRequest .id });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in POST /api/medtech_request:", error.message);
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

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const filter = searchParams.get("filter") || "all";

    const skip = (page - 1) * limit;

    const whereClause: Prisma.MedTechRequestWhereInput = {
      isArchived: false,
    };

    // Add status filter
    if (filter !== "all") {
      whereClause.status = filter as MedTechStatus;
    }

    const [requests, total] = await Promise.all([
      db.medTechRequest.findMany({
        where: whereClause,
        include: {
          items: { 
            include: { 
              product: true 
            } 
          },
          requestedBy: {
            select: { username: true },
          },
          receivedBy: {
            select: { username: true },
          },
          approvedBy: {
            select: { username: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.medTechRequest.count({ where: whereClause }),
    ]);

    const formattedRequests = requests.map((req) => ({
      ...req,
     requestedBy: req.requestedBy?.username ? toTitleCase(req.requestedBy.username) : "Unknown",
      receivedBy: req.receivedBy?.username ? toTitleCase(req.receivedBy.username) : "Unknown",
      approvedBy: req.approvedBy?.username ? toTitleCase(req.approvedBy.username) : "Unknown",
      remarks: req.remarks,
      status: req.status,
      notes: req.notes,
       createdAt: req.createdAt,
      itemDetails: req.items.map((i) => ({
        productName: i.product.product_name,
        quantity: i.quantity,
        price: i.product.price || 0,
      })),
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: formattedRequests,
      total,
      totalPages,
      currentPage: page,
    });
    
  } catch (error) {
    console.error("Error fetching MedTech requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch MedTech requests" },
      { status: 500 }
    );
  }
}
