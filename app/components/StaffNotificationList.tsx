import { Notification } from "@/lib/interfaces";
import { formattedDateTime } from "@/lib/utils";
import React from "react";
import { IoCheckmarkDone } from "react-icons/io5";

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
    patient_name: string;
    room_number: string;
  };
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
              {notifications.map((notification) => {
                const patientName =
                  notification.patientName || notification.order?.patient_name;
                const roomNumber =
                  notification.roomNumber || notification.order?.room_number;
                const submittedBy =
                  notification.submittedBy || notification.sender?.username;
                const role = notification.role || notification.sender?.role;

                return (
                  <div
                    key={`${notification.id}-${notification.createdAt}`}
                    className="px-4 py-2 border-b hover:bg-gray-50 cursor-pointer"
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
                          emergency order
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
    </>
  );
};

export default StaffNotificationList;
