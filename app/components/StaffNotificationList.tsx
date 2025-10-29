import { EmergencyOrderModalData, Notification } from "@/lib/interfaces";
import { useOrderModal } from "@/lib/store/useOrderModal";
import { formattedDateTime } from "@/lib/utils";
import React, { useState } from "react";
import { IoCheckmarkDone } from "react-icons/io5";
import { OrderView } from "./transaction/cashier/CashierAction";
import OrderDetailsModal from "./OrderDetailsModal";
import { useEmergencyModal } from "@/lib/store/emergency-modal";
import EmergencyOrderModal from "./EmergencyModal";
import { OrderModalSkeleton } from "./Skeleton";

export interface NotificationWithDetails extends Notification {
  patientName?: string;
  roomNumber?: string;
  submittedBy?: string;
  role?: string;
  sender?: {
    username: string;
    role: string;
  };
  order?: {
    id: number;
    patient_name: string;
    room_number: string;
  };
}

interface ApiOrderItem {
  quantity: number;
  product: {
    product_name: string;
    price: number;
  } | null;
}

interface ApiOrderResponse {
  id: number;
  type: "REGULAR" | "EMERGENCY";
  user?: { username?: string };
  receivedBy?: { username?: string };
  processedBy?: { username?: string };
  patient_name?: string;
  room_number?: string | number;
  notes?: string;
  status: "pending" | "for_payment" | "paid" | "canceled";
  createdAt: string;
  items: ApiOrderItem[];
}

const StaffNotificationList = ({
  notifications,
  dropdown,
  connectionStatus,
  userRole,
}: {
  notifications: NotificationWithDetails[];
  dropdown: boolean;
  connectionStatus: "connected" | "disconnected" | "connecting";
  userRole: string;
}) => {
  const uniqueNotifications = Array.from(
    new Map(notifications.map((n) => [n.id, n])).values()
  );

  const [loading, setLoading] = useState(false);

  const { openModal } = useOrderModal();
  const { openModal: openEmergencyModal } = useEmergencyModal();

  const handleNotificationClick = async (
    notification: NotificationWithDetails
  ) => {
    if (!notification.order?.id) return;

    setLoading(true);

    try {
      const res = await fetch(
        `/api/request_order/${notification.order.id}/notification`
      );
      if (!res.ok) throw new Error("Failed to fetch order details");

      const data: ApiOrderResponse = await res.json();

      if (data.type === "EMERGENCY") {
        const payLaterData: EmergencyOrderModalData = {
          id: data.id,
          orderType: data.type,
          order: {
            id: data.id,
            patient_name: data.patient_name ?? "Unknown",
            room_number: data.room_number?.toString() ?? "Unknown",
            status: data.status,
            products: data.items.map((item) => ({
              productName: item.product?.product_name ?? "Unknown",
              quantity: item.quantity,
              price: item.product?.price ?? 0,
            })),
          },
          createdAt: new Date(data.createdAt),
          notes: data.notes ?? "",
          sender: {
            username: notification.sender?.username ?? "Unknown",
            role: notification.sender?.role ?? "Unknown",
          },
        };
        openEmergencyModal(payLaterData);
        return; // prevent opening regular order
      }

      const orderView: OrderView = {
        id: `ORD-${data.id}`,
        type: data.type ?? "REGULAR",
        requestedBy: data.user?.username ?? "Unknown",
        receivedBy: data.receivedBy?.username ?? "Unknown",
        processedBy: data.processedBy?.username ?? "Unknown",
        customer: data.patient_name ?? "Unknown",
        patient_name: data.patient_name ?? "Unknown",
        roomNumber: data.room_number?.toString() ?? "N/A",
        notes: data.notes ?? "",
        quantity: data.items?.reduce((sum, i) => sum + i.quantity, 0),
        price: data.items?.reduce((sum, i) => sum + (i.product?.price ?? 0), 0),
        total: data.items?.reduce(
          (sum, i) => sum + i.quantity * (i.product?.price ?? 0),
          0
        ),
        status: data.status,
        createdAt: new Date(data.createdAt),
        source: "Request Order",
        itemDetails: data.items.map((i) => ({
          productName: i.product?.product_name ?? "Unknown",
          quantity: i.quantity,
          price: i.product?.price ?? 0,
        })),
      };

      openModal(orderView);
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {dropdown && (
        <div className="bg-white w-[400px] h-auto absolute shadow-lg z-20 top-11 -right-24 rounded-md max-w-[500px] max-h-[95vh] overflow-auto">
          {notifications.length === 0 ? (
            <p className="text-center p-10 text-gray-400">No Notifications</p>
          ) : (
            <>
              <div className="flex justify-between border-b px-4 py-2 sticky top-0 bg-white">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      connectionStatus === "connected"
                        ? "bg-green-500"
                        : connectionStatus === "disconnected"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  ></div>
                  <p className="text-lg font-semibold">Notifications</p>
                </div>

                <p className="flex items-center gap-2 text-green-600 cursor-pointer">
                  <IoCheckmarkDone />
                  <span className="text-sm">Mark all as read</span>
                </p>
              </div>
              {uniqueNotifications.map((notification) => {
                const patientName =
                  notification.patientName || notification.order?.patient_name;
                const roomNumber =
                  notification.roomNumber || notification.order?.room_number;
                const submittedBy =
                  notification.submittedBy || notification.sender?.username;
                const role = notification.role || notification.sender?.role;

                return (
                  <div
                    key={notification.id}
                    className="px-4 py-2 border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <p className="font-semibold">{notification.title}</p>

                    {notification.type === "ORDER_REQUEST" && (
                      <p className="text-sm text-gray-700 mt-1">
                        A new request for patient{" "}
                        <span className="text-blue-600 font-semibold">
                          {patientName || "Unknown"}
                        </span>{" "}
                        in room{" "}
                        <span className="text-blue-600 font-semibold">
                          {roomNumber || "Unknown"}
                        </span>{" "}
                        has been submitted by{" "}
                        <span className="font-medium">
                          {submittedBy || "Unknown"} ({role || "Unknown"})
                        </span>
                        .
                      </p>
                    )}

                    {notification.type === "ORDER_RECEIVED" &&
                    userRole === "Cashier" ? (
                      <p className="text-sm text-gray-700 mt-1">
                        A new order for patient{" "}
                        <span className="text-blue-600 font-semibold">
                          {patientName || "Unknown"}
                        </span>{" "}
                        in room{" "}
                        <span className="text-blue-600 font-semibold">
                          {roomNumber || "Unknown"}
                        </span>{" "}
                        has been marked as ready for payment by{" "}
                        <span className="font-medium">
                          {submittedBy || "Unknown"} ({role || "Unknown"})
                        </span>
                        .
                      </p>
                    ) : (
                      notification.type === "ORDER_RECEIVED" &&
                      userRole === "Nurse" && (
                        <p className="text-sm text-gray-700 mt-1">
                          Your order request for patient{" "}
                          <span className="text-blue-600 font-semibold">
                            {patientName || "Unknown"}
                          </span>{" "}
                          in room{" "}
                          <span className="text-blue-600 font-semibold">
                            {roomNumber || "Unknown"}
                          </span>{" "}
                          has been received by{" "}
                          <span className="font-medium">
                            {submittedBy || "Unknown"} ({role || "Unknown"})
                          </span>
                          .
                        </p>
                      )
                    )}

                    {notification.type === "PAYMENT_PROCESSED" && (
                      <p className="text-sm text-gray-700 mt-1">
                        The payment for patient{" "}
                        <span className="text-blue-600 font-semibold">
                          {patientName || "Unknown"}
                        </span>{" "}
                        in room{" "}
                        <span className="text-blue-600 font-semibold">
                          {roomNumber || "Unknown"}
                        </span>{" "}
                        has been processed by{" "}
                        <span className="font-medium">
                          {submittedBy || "Unknown"} ({role || "Unknown"})
                        </span>
                        .
                      </p>
                    )}

                    {notification.type === "EMERGENCY_ORDER" && (
                      <p className="text-sm text-gray-700 mt-1">
                        An{" "}
                        <span className="text-red-600 font-semibold">
                          pay later order
                        </span>{" "}
                        has been submitted for patient{" "}
                        <span className="text-blue-600 font-semibold">
                          {patientName || "Unknown"}
                        </span>{" "}
                        in room{" "}
                        <span className="text-blue-600 font-semibold">
                          {roomNumber || "Unknown"}
                        </span>{" "}
                        by{" "}
                        <span className="font-medium">
                          {submittedBy || "Unknown"} ({role || "Unknown"})
                        </span>
                        .
                      </p>
                    )}

                    {notification.type === "REMARKS" && (
                      <p className="text-sm text-gray-700 mt-1">
                        The order for patient{" "}
                        <span className="text-blue-600 font-semibold">
                          {patientName || "Unknown"}
                        </span>{" "}
                        in room{" "}
                        <span className="text-blue-600 font-semibold">
                          {roomNumber || "Unknown"}
                        </span>{" "}
                        has been{" "}
                        <span className="text-green-600 font-semibold">
                          prepared
                        </span>{" "}
                        by{" "}
                        <span className="font-medium">
                          {submittedBy || "Unknown"} ({role || "Unknown"})
                        </span>
                        .
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-2">
                      {formattedDateTime(notification.createdAt)}
                    </p>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
      {loading && <OrderModalSkeleton />}
      <OrderDetailsModal hasPrint={true} />
      <EmergencyOrderModal />
    </>
  );
};

export default StaffNotificationList;
