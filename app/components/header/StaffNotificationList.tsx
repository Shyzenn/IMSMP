import { Notification, OrderItem, OrderView } from "@/lib/interfaces";
import { useOrderModal } from "@/lib/store/useOrderModal";
import { formattedDateTime } from "@/lib/utils";
import React, { useState } from "react";
import { useEmergencyModal } from "@/lib/store/emergency-modal";
import { OrderModalSkeleton } from "../ui/Skeleton";
import MedTechRequestDetailsModal, {
  RequestView,
} from "../medtech/MTRequestDetails";

const StaffNotificationList = ({
  notifications,
  dropdown,
  connectionStatus,
  userRole,
}: {
  notifications: Notification[];
  dropdown: boolean;
  connectionStatus: "connected" | "disconnected" | "connecting";
  userRole: string;
}) => {
  const uniqueNotifications = Array.from(
    new Map(notifications.map((n) => [n.id, n])).values()
  );
  const [selectedRequest, setSelectedRequest] = useState<RequestView | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { openModal } = useOrderModal();
  const { openModal: openEmergencyModal } = useEmergencyModal();

  console.log(notifications);

  const handleNotificationClick = async (notification: Notification) => {
    const hasValidId =
      notification.orderId ||
      notification.order?.id ||
      notification.walkInOrderId ||
      notification.medTechRequestId;

    if (!hasValidId) {
      console.log("No valid ID found for notification:", notification.type);
      return;
    }

    setLoading(true);

    try {
      // --- MEDTECH REQUEST NOTIFICATIONS ---
      if (
        (notification.type === "MEDTECH_REQUEST" ||
          notification.type === "MEDTECH_REQUEST_EDIT" ||
          notification.type === "MT_REQUEST_READY" ||
          notification.type === "MT_REQUEST_RELEASED" ||
          notification.type === "MT_REQUEST_APPROVED" ||
          notification.type === "MT_REQUEST_DECLINED") &&
        notification.medTechRequestId
      ) {
        const res = await fetch(
          `/api/medtech_request/${notification.medTechRequestId}/notification`
        );
        if (!res.ok) {
          console.error("Failed to fetch MedTech request");
          return;
        }
        const data = (await res.json()) as {
          id: number;
          status: "pending_for_approval" | "approved" | "declined";
          remarks: "processing" | "ready" | "released";
          notes: string;
          createdAt: string;
          price: number;
          items: OrderItem[];
          requestedBy?: { username: string } | null;
          receivedBy?: { username: string } | null;
          approvedBy: { username: string } | null;
        };

        const requestView: RequestView = {
          id: `${data.id}`,
          status: data.status,
          remarks: data.remarks,
          notes: data.notes,
          price: data.price,
          quantity: data.items.reduce((sum, i) => sum + i.quantityOrdered, 0),
          createdAt: new Date(data.createdAt),
          requestedBy: data.requestedBy,
          receivedBy: data.receivedBy,
          approvedBy: data.approvedBy,
          itemDetails: data.items.map((i) => ({
            productName: i.productName ?? "Unknown",
            quantityOrdered: i.quantityOrdered,
            price: i.price,
          })),
        };

        setSelectedRequest(requestView);
        setIsModalOpen(true);
        return;
      }

      // --- WALK-IN NOTIFICATION ---
      if (notification.type === "WALK_IN" && notification.walkInOrderId) {
        const res = await fetch(
          `/api/walkin_order/${notification.walkInOrderId}/notification`
        );

        if (!res.ok) {
          console.error("Failed to fetch walk-in order");
          return;
        }

        const data: OrderView = await res.json();

        console.log(data);

        openModal(data);
        return;
      }

      // --- REQUEST ORDER NOTIFICATIONS ---
      const orderIdToFetch = notification.order?.id || notification.orderId;

      if (
        orderIdToFetch &&
        (notification.type === "ORDER_RECEIVED" ||
          notification.type === "ORDER_REQUEST" ||
          notification.type === "EMERGENCY_ORDER" ||
          notification.type === "PAYMENT_PROCESSED" ||
          notification.type === "REMARKS")
      ) {
        const res = await fetch(
          `/api/request_order/${orderIdToFetch}/notification`
        );
        if (!res.ok) {
          console.error("Failed to fetch order details");
          return;
        }
        const data: OrderView = await res.json();

        if (data.type === "EMERGENCY") {
          openEmergencyModal(data);
          return;
        }

        openModal(data);
        return;
      }

      console.log("Notification type not handled:", notification.type);
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {dropdown && (
        <div className="bg-white w-[380px] md:w-[400px] h-auto absolute shadow-lg z-20 top-11 md:-right-56 -right-36 rounded-md max-w-[500px] max-h-[90vh] overflow-auto">
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
              </div>
              {uniqueNotifications.map((notification) => {
                const patientName =
                  notification.patientName ||
                  notification.order?.patientDetails?.patientNumber ||
                  "Unknown";

                const roomNumber =
                  notification.roomNumber ||
                  notification.order?.patientDetails?.roomNumber ||
                  "N/A";

                const submittedBy =
                  notification.submittedBy ||
                  notification.sender?.username ||
                  "Unknown";

                const role =
                  notification.role || notification.sender?.role || "Unknown";

                return (
                  <div
                    key={notification.id}
                    className="px-4 py-2 border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {!notification.read && (
                      <span className="w-2 h-2 mt-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                    )}
                    <p className="font-semibold">{notification.title}</p>

                    {notification.type === "MEDTECH_REQUEST_EDIT" &&
                      userRole === "Manager" && (
                        <p className="text-sm text-gray-700 mt-1">
                          request has been edited by{" "}
                          <span className="font-medium">
                            {submittedBy || "Unknown"} ({role || "Unknown"})
                          </span>
                          .
                        </p>
                      )}

                    {notification.type === "MT_REQUEST_DECLINED" &&
                      userRole === "MedTech" && (
                        <p className="text-sm text-gray-700 mt-1">
                          Your MedTech request has been declined by{" "}
                          <span className="font-medium">
                            {submittedBy || "Unknown"} ({role || "Unknown"})
                          </span>
                          .
                        </p>
                      )}

                    {notification.type === "MT_REQUEST_DECLINED" &&
                      userRole === "Pharmacist_Staff" && (
                        <p className="text-sm text-gray-700 mt-1">
                          A MedTech request has been declined by{" "}
                          <span className="font-medium">
                            {submittedBy || "Unknown"} ({role || "Unknown"})
                          </span>
                          .
                        </p>
                      )}

                    {notification.type === "MT_REQUEST_APPROVED" &&
                      userRole === "Pharmacist_Staff" && (
                        <p className="text-sm text-gray-700 mt-1">
                          A MedTech request has been approved by{" "}
                          <span className="font-medium">
                            {submittedBy || "Unknown"} ({role || "Unknown"})
                          </span>
                          .
                        </p>
                      )}

                    {notification.type === "MT_REQUEST_APPROVED" &&
                      userRole === "MedTech" && (
                        <p className="text-sm text-gray-700 mt-1">
                          Your MedTech request has been approved by{" "}
                          <span className="font-medium">
                            {submittedBy || "Unknown"} ({role || "Unknown"})
                          </span>
                          .
                        </p>
                      )}

                    {notification.type === "MT_REQUEST_RELEASED" &&
                      userRole === "MedTech" && (
                        <p className="text-sm text-gray-700 mt-1">
                          Your MedTech request has been released by{" "}
                          <span className="font-medium">
                            {submittedBy || "Unknown"} ({role || "Unknown"})
                          </span>
                          .
                        </p>
                      )}

                    {notification.type === "MT_REQUEST_RELEASED" &&
                      userRole === "Manager" && (
                        <p className="text-sm text-gray-700 mt-1">
                          A MedTech request has been released by{" "}
                          <span className="font-medium">
                            {submittedBy || "Unknown"} ({role || "Unknown"})
                          </span>
                          .
                        </p>
                      )}

                    {notification.type === "MT_REQUEST_READY" &&
                      userRole === "MedTech" && (
                        <p className="text-sm text-gray-700 mt-1">
                          Your MedTech request is ready for pickup. Prepared by{" "}
                          <span className="font-medium">
                            {submittedBy || "Unknown"}
                          </span>
                          .
                        </p>
                      )}

                    {notification.type === "MEDTECH_REQUEST" &&
                      userRole === "Pharmacist_Staff" && (
                        <p className="text-sm text-gray-700 mt-1">
                          You have a new MedTech Request from{" "}
                          <span className="font-medium">
                            {submittedBy || "Unknown"} ({role || "Unknown"})
                          </span>
                          .
                        </p>
                      )}

                    {notification.type === "MEDTECH_REQUEST" &&
                      userRole === "Manager" && (
                        <p className="text-sm text-gray-700 mt-1">
                          New MedTech request submitted by{" "}
                          <span className="font-medium">
                            {submittedBy || "Unknown"} ({role || "Unknown"})
                          </span>
                          .
                        </p>
                      )}

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

                    {notification.type === "WALK_IN" && (
                      <p className="text-sm text-gray-700 mt-1">
                        A new walk in order has been submitted by{" "}
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
      <MedTechRequestDetailsModal
        isRequestModalOpen={isModalOpen}
        selectedRequest={selectedRequest}
        setIsOrderModalOpen={setIsModalOpen}
      />
    </>
  );
};

export default StaffNotificationList;
