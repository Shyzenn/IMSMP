"use client";

import { toTitleCase } from "@/lib/utils";
import { useEmergencyModal } from "@/lib/store/emergency-modal";
import { LuPrinter } from "react-icons/lu";
import { useSession } from "next-auth/react";
import CancelButton from "../ui/CancelButton";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { OrderTimeline } from "../ui/OrderTimeline";
import Modal from "../ui/Modal";
import OrderProductTable from "../ui/OrderProductTable";
import { printOrderRequest } from "@/lib/printUtlis";

export default function EmergencyOrderModal() {
  const { isOpen, orderData, closeModal } = useEmergencyModal();

  const { data: session } = useSession();
  const userRole = session?.user.role;

  if (!isOpen || !orderData) return null;

  const subtotal = orderData.itemDetails.reduce(
    (sum, item) => sum + item.price * item.quantityOrdered,
    0
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={closeModal} width="max-w-lg">
        <div
          className="space-y-2 text-sm w-full print:block"
          id="print-section"
        >
          <div className="flex justify-between items-center border-b-2 border-gray-100 pb-2 w-full">
            <div className="flex items-baseline justify-between w-full">
              <div className="flex flex-col gap-2">
                <p className="text-lg font-semibold">
                  ORD-0{orderData.id}{" "}
                  {orderData.status === "refunded" ? "(Refunded)" : ""}
                </p>
                <p className="text-gray-500">Order Details</p>
              </div>

              {userRole !== "Pharmacist_Staff" && (
                <button onClick={closeModal}>
                  <IoIosCloseCircleOutline className="text-2xl text-red-500" />
                </button>
              )}

              {userRole === "Pharmacist_Staff" &&
                orderData.status !== "pending" && (
                  <button onClick={closeModal}>
                    <IoIosCloseCircleOutline className="text-2xl text-red-500" />
                  </button>
                )}
            </div>
          </div>

          {/* Order Info */}
          <div className="flex flex-col gap-5 pb-2">
            <div className="w-full flex flex-col gap-2">
              {/* Patient Name */}
              <div className="grid grid-cols-[50%_50%] gap-2">
                <p className="text-gray-500 text-sm">Patient Name</p>
                <p className="font-medium text-black text-xs break-words">
                  {toTitleCase(
                    orderData.patientDetails?.patientName ?? "Unknown"
                  )}
                </p>
              </div>

              {/* Room Number */}
              <div className="grid grid-cols-[50%_50%] gap-2">
                <p className="text-gray-500 text-sm">Room Number</p>
                <p className="font-medium text-black text-xs break-words">
                  {orderData.patientDetails?.roomNumber ?? "Unknown"}
                </p>
              </div>

              {/* Created At */}
              <div className="grid grid-cols-[50%_50%] gap-2">
                <p className="text-gray-500 text-sm">Created At</p>
                <p className="font-medium text-black text-xs break-words">
                  {new Date(orderData.createdAt).toLocaleString("en-PH", {
                    timeZone: "Asia/Manila",
                  })}
                </p>
              </div>

              {/* Type */}
              <div className="grid grid-cols-[50%_50%] gap-2">
                <p className="text-gray-500 text-sm">Type</p>
                <p className="font-medium text-black text-xs break-words">
                  {orderData.type === "EMERGENCY"
                    ? "Pay Later"
                    : orderData.type}
                </p>
              </div>
            </div>
          </div>
        </div>
        <OrderTimeline order={orderData} />
        <div className="border-t pt-4">
          <OrderProductTable currentOrder={orderData} />
        </div>
        {orderData.notes && orderData.notes?.length > 0 ? (
          <div className="border p-2 bg-slate-50 rounded-md shadow-sm print:hidden mt-2 text-sm">
            <p className="font-semibold mb-2">Notes:</p>
            <p>{orderData.notes}</p>
          </div>
        ) : null}

        <div className="flex justify-end mt-4 print:hidden gap-4 bg-white ">
          {orderData.status === "paid" ? (
            <button
              type="button"
              className="border px-6 py-2 rounded-md hover:bg-gray-50"
              onClick={closeModal}
            >
              Close
            </button>
          ) : (
            <>
              <CancelButton setIsModalOpen={closeModal} />
              {userRole === "Pharmacist_Staff" && (
                <button
                  onClick={() =>
                    printOrderRequest(orderData, subtotal, closeModal)
                  }
                  className="bg-buttonBgColor hover:bg-buttonHover text-white px-8 py-2 rounded-md flex items-center gap-2"
                >
                  <LuPrinter />
                  Print
                </button>
              )}
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
