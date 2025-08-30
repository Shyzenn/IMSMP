import { Notification } from "@/lib/interfaces";
import React from "react";
import { IoCheckmarkDone } from "react-icons/io5";

const NotificationList = ({
  notifications,
  dropdown,
  connectionStatus,
}: {
  notifications: Notification[];
  dropdown: boolean;
  connectionStatus: "connected" | "disconnected" | "connecting";
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
                const safeJsonParse = (data: string) => {
                  try {
                    return JSON.parse(data);
                  } catch {
                    return null;
                  }
                };

                const messageData = safeJsonParse(notification.message);

                return (
                  <div
                    key={`${notification.id}-${notification.createdAt}`}
                    className="px-4 py-2 border-b"
                  >
                    <p>{notification.title}</p>

                    {notification.type === "ORDER_REQUEST" && (
                      <p className="text-sm">
                        A new request for patient{" "}
                        <span className="text-blue-600 font-semibold">
                          {messageData?.patientName}
                        </span>{" "}
                        in room{" "}
                        <span className="text-blue-600 font-semibold">
                          {messageData?.roomNumber}
                        </span>{" "}
                        has been submitted by{" "}
                        <span className="font-medium">
                          {messageData?.submittedBy}({messageData?.role})
                        </span>
                        .
                      </p>
                    )}

                    {notification.type === "ADD_PRODUCT" && (
                      <p className="text-sm">
                        A new product{" "}
                        <span className="text-green-600 font-semibold">
                          {messageData?.productName}{" "}
                        </span>
                        has been added by{" "}
                        <span className="font-medium">
                          {messageData?.submittedBy}
                        </span>
                        .
                      </p>
                    )}
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

export default NotificationList;
