import { OrderItem, EmergencyOrderModalData } from "@/lib/interfaces";
import { OrderView } from "@/app/components/transaction/cashier/CashierAction";
import { OrderRequest } from "@prisma/client";

export type RequestOrderWithItems = OrderRequest & {
  itemDetails: OrderItem[];
  requestedBy?: string;
  receivedBy?: string;
  processedBy?: string;
};

type OrderWithBothRooms = RequestOrderWithItems & {
  roomNumber?: string | number | null;
};


export function convertToOrderView(order: RequestOrderWithItems): OrderView {
   const o = order as OrderWithBothRooms;
    const room =
    o.roomNumber ??
    o.room_number ??
    "";
  const items = order.itemDetails ?? [];

  return {
    id: `ORD-0${order.id}`,
    type: order.type === "REGULAR" ? "REGULAR" : "EMERGENCY",
    requestedBy: order.requestedBy ?? "Unknown",
    receivedBy: order.receivedBy ?? "Unknown",
    processedBy: order.processedBy ?? "Unknown",
    customer: order.patient_name ?? "Unknown",
    patient_name: order.patient_name ?? "Unknown",
     roomNumber: String(room),

    notes: order.notes ?? "",
    quantity: items.reduce((sum, i) => sum + i.quantity, 0),
    price: items.reduce((sum, i) => sum + (i.price ?? 0), 0),
    total: items.reduce((sum, i) => sum + i.quantity * (i.price ?? 0), 0),
    remarks: order.remarks as OrderView["remarks"],
    status: order.status as OrderView["status"],
    createdAt: new Date(order.createdAt),
    source: "Request Order",
    itemDetails: items.map((i) => ({
      productName: i.productName ?? "Unknown",
      quantity: i.quantity,
      price: i.price ?? 0,
    })),
  };
}

export function convertToEmergencyOrder(order: RequestOrderWithItems): EmergencyOrderModalData {
  const items = order.itemDetails ?? [];
  const o = order as OrderWithBothRooms;
  const room = o.roomNumber ?? o.room_number ?? "";

  return {
    id: order.id,
    orderType: "EMERGENCY",
    sender: {
      username: order.requestedBy ?? "Unknown",
    },
    order: {
      id: order.id,
      patient_name: order.patient_name ?? "Unknown",
      room_number: String(room),
      status: order.status,
      products: items,
    },
    notes: order.notes ?? "",
    createdAt: new Date(order.createdAt),
  };
}
