"use client";

import { OrderView } from "@/lib/interfaces";
import { toTitleCase } from "@/lib/utils";
import React, { Dispatch, SetStateAction, useState } from "react";
import { LuPrinter } from "react-icons/lu";
import { useSession } from "next-auth/react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { useQueryClient } from "@tanstack/react-query";
import { useOrderModal } from "@/lib/store/useOrderModal";
import { printOrderRequest } from "@/lib/printUtlis";
import { Textarea } from "@/components/ui/textarea";
import CancelButton from "../ui/CancelButton";
import { OrderTimeline } from "../ui/OrderTimeline";
import Modal from "../ui/Modal";
import OrderProductTable from "../ui/OrderProductTable";
import PrintConfirmationModal from "../ui/PrintConfirmationModa";

interface OrderDetailsModalProps {
  isOrderModalOpen?: boolean;
  selectedOrder?: OrderView | null;
  setIsOrderModalOpen?: Dispatch<SetStateAction<boolean>>;
  hasPrint: boolean;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOrderModalOpen,
  selectedOrder,
  setIsOrderModalOpen,
  hasPrint,
}) => {
  // global modal (for notifications)
  const {
    isOpen: globalOpen,
    selectedOrder: globalOrder,
    closeModal: closeGlobalModal,
  } = useOrderModal();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { data: session } = useSession();
  const userRole = session?.user.role;
  const queryClient = useQueryClient();

  // pick either local props or global state
  const isActive = isOrderModalOpen || globalOpen; // global
  const currentOrder = selectedOrder || globalOrder; // local

  if (!isActive || !currentOrder) return null;

  const handleClose = () => {
    if (setIsOrderModalOpen) setIsOrderModalOpen(false);
    closeGlobalModal();
  };

  const printOrder = async () => {
    setIsConfirmOpen(false);
    if (!currentOrder) return;

    try {
      await fetch(`/api/request_order/${currentOrder.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "for_payment" }),
        headers: { "Content-Type": "application/json" },
      });

      await fetch("/api/audit-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "Order Printed",
          entityType: "Order",
          entityId: currentOrder.id,
          description: `${userRole} prints the order ${currentOrder.id}`,
        }),
      });

      queryClient.invalidateQueries({
        queryKey: ["request_order"],
      });
      queryClient.invalidateQueries({
        queryKey: ["order_cards"],
      });
      queryClient.invalidateQueries({
        queryKey: ["salesData", "This Year"],
      });

      currentOrder.status = "for_payment";
      handleClose();
    } catch (error) {
      console.error("Failed to update status after printing", error);
    }
  };

  return (
    <>
      <Modal isOpen={globalOpen} onClose={closeGlobalModal} width="max-w-lg">
        <div
          className="space-y-2 text-sm w-full print:block"
          id="print-section"
        >
          <div className="flex justify-between items-center border-b-2 border-gray-100 pb-2 w-full">
            <div className="flex items-baseline justify-between w-full">
              <div className="flex flex-col gap-2">
                <p className="text-lg font-semibold">
                  {currentOrder.type === "Walk In" ? "WLK-IN-0" : "ORD-0"}
                  {currentOrder.id}{" "}
                  {currentOrder.status === "refunded" ? "(Refunded)" : ""}
                </p>
                <p className="text-gray-500">Order Details</p>
              </div>

              {userRole !== "Pharmacist_Staff" && (
                <button onClick={handleClose}>
                  <IoIosCloseCircleOutline className="text-2xl text-red-500" />
                </button>
              )}

              {userRole === "Pharmacist_Staff" &&
                currentOrder.status !== "pending" && (
                  <button onClick={handleClose}>
                    <IoIosCloseCircleOutline className="text-2xl text-red-500" />
                  </button>
                )}
            </div>
          </div>

          {/* Order Info */}
          <div className="flex flex-col gap-5 pb-2">
            {currentOrder.type !== "Walk In" ? (
              <div className="w-full flex flex-col gap-2">
                {/* Patient Name */}
                <div className="grid grid-cols-[50%_50%] gap-2">
                  <p className="text-gray-500 text-sm">Patient Name</p>
                  <p className="font-medium text-black text-xs break-words">
                    {toTitleCase(
                      currentOrder.patientDetails?.patientName ?? "Unknown"
                    )}
                  </p>
                </div>

                {/* Room Number */}
                <div className="grid grid-cols-[50%_50%] gap-2">
                  <p className="text-gray-500 text-sm">Room Number</p>
                  <p className="font-medium text-black text-xs break-words">
                    {currentOrder.patientDetails?.roomNumber ?? "N/A"}
                  </p>
                </div>

                {/* Contact Number */}
                <div className="grid grid-cols-[50%_50%] gap-2">
                  <p className="text-gray-500 text-sm">Contact Number</p>
                  <p className="font-medium text-black text-xs break-words">
                    {currentOrder.patientDetails?.contactNumber ?? "N/A"}
                  </p>
                </div>

                {/* Created At */}
                <div className="grid grid-cols-[50%_50%] gap-2">
                  <p className="text-gray-500 text-sm">Created At</p>
                  <p className="font-medium text-black text-xs break-words">
                    {new Date(currentOrder.createdAt).toLocaleString("en-PH", {
                      timeZone: "Asia/Manila",
                    })}
                  </p>
                </div>

                {/* Type */}
                <div className="grid grid-cols-[50%_50%] gap-2">
                  <p className="text-gray-500 text-sm">Type</p>
                  <p className="font-medium text-black text-xs break-words">
                    {currentOrder.type === "EMERGENCY"
                      ? "Pay Later"
                      : currentOrder.type === "REGULAR"
                      ? "Regular"
                      : "Regular"}
                  </p>
                </div>

                {/* Refunded Section */}
                {currentOrder.status === "refunded" && (
                  <>
                    <div className="grid grid-cols-[50%_50%] gap-2">
                      <p className="text-gray-500 text-sm">Refunded At</p>
                      <p className="font-medium text-black text-xs break-words">
                        {new Date(
                          currentOrder?.refundedAt ?? "Unknown"
                        ).toLocaleString("en-PH", {
                          timeZone: "Asia/Manila",
                        })}
                      </p>
                    </div>

                    <div className="grid grid-cols-[50%_50%] gap-2">
                      <p className="text-gray-500 text-sm">Refunded By</p>
                      <p className="font-medium text-black text-xs break-words">
                        {toTitleCase(currentOrder.refundedBy ?? "Unknown")}
                      </p>
                    </div>

                    <div className="grid grid-cols-[50%_50%] gap-2 items-start">
                      <p className="text-gray-500 text-sm">Reason</p>
                      <Textarea
                        className="font-medium text-black text-xs"
                        readOnly
                        value={
                          currentOrder.refundedReason ?? "No reason provided"
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full flex flex-col gap-2">
                {/* Customer Name */}
                <div className="grid grid-cols-[50%_50%] gap-2">
                  <p className="text-gray-500 text-sm">Customer Name</p>
                  <p className="font-medium text-black text-xs break-words">
                    {toTitleCase(currentOrder.customer ?? "Unknown")}
                  </p>
                </div>

                {/* Type */}
                <div className="grid grid-cols-[50%_50%] gap-2">
                  <p className="text-gray-500 text-sm">Type</p>
                  <p className="font-medium text-black text-xs break-words">
                    {currentOrder.type}
                  </p>
                </div>

                {/* Created At */}
                <div className="grid grid-cols-[50%_50%] gap-2">
                  <p className="text-gray-500 text-sm">Created At</p>
                  <p className="font-medium text-black text-xs break-words">
                    {new Date(currentOrder.createdAt).toLocaleString("en-PH", {
                      timeZone: "Asia/Manila",
                    })}
                  </p>
                </div>

                {/* Handled By */}
                <div className="grid grid-cols-[50%_50%] gap-2">
                  <p className="text-gray-500 text-sm">Handled By</p>
                  <p className="font-medium text-black text-xs break-words">
                    {currentOrder.paymentDetails?.[0]?.processedBy.username ??
                      ""}
                  </p>
                </div>

                {/* Refunded Section */}
                {currentOrder.status === "refunded" && (
                  <>
                    <div className="grid grid-cols-[50%_50%] gap-2">
                      <p className="text-gray-500 text-sm">Refunded At</p>
                      <p className="font-medium text-black text-xs break-words">
                        {new Date(
                          currentOrder?.refundedAt ?? "Unknown"
                        ).toLocaleString("en-PH", {
                          timeZone: "Asia/Manila",
                        })}
                      </p>
                    </div>

                    <div className="grid grid-cols-[50%_50%] gap-2">
                      <p className="text-gray-500 text-sm">Refunded By</p>
                      <p className="font-medium text-black text-xs break-words">
                        {toTitleCase(currentOrder.refundedBy ?? "Unknown")}
                      </p>
                    </div>

                    <div className="grid grid-cols-[50%_50%] gap-2 items-start">
                      <p className="text-gray-500 text-sm">Reason</p>
                      <Textarea
                        className="font-medium text-black text-xs"
                        readOnly
                        value={
                          currentOrder.refundedReason ?? "No reason provided"
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          {currentOrder.type !== "Walk In" && (
            <OrderTimeline order={currentOrder} />
          )}
          <div className="border-t pt-4">
            <OrderProductTable currentOrder={currentOrder} />
          </div>
          {currentOrder.notes && currentOrder.notes?.length > 0 ? (
            <div className="border p-2 bg-slate-50 rounded-md shadow-sm print:hidden">
              <p className="font-semibold mb-2">Notes:</p>
              <p>{currentOrder.notes}</p>
            </div>
          ) : null}

          {/* Buttons */}
          {session?.user.role === "Pharmacist_Staff" &&
            currentOrder.status === "pending" &&
            hasPrint && (
              <div className="flex justify-end print:hidden gap-4">
                <CancelButton setIsModalOpen={handleClose} />
                <button
                  onClick={() => {
                    if (!currentOrder.patientDetails) return;

                    const subtotal = currentOrder.itemDetails.reduce(
                      (sum, item) => sum + item.price * item.quantityOrdered,
                      0
                    );

                    printOrderRequest(currentOrder, subtotal, () =>
                      setIsConfirmOpen(true)
                    );
                  }}
                  className="bg-buttonBgColor hover:bg-buttonHover text-white px-8 py-2 rounded-md flex items-center gap-2"
                >
                  <LuPrinter />
                  Print
                </button>
              </div>
            )}
        </div>
      </Modal>

      {/* Confirm Print Modal */}
      {isConfirmOpen && (
        <PrintConfirmationModal
          isOpen={isConfirmOpen}
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={printOrder}
        />
      )}
    </>
  );
};

export default OrderDetailsModal;
