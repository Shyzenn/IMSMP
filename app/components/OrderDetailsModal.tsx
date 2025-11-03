"use client";

import { OrderItem } from "@/lib/interfaces";
import { capitalLetter } from "@/lib/utils";
import React, { Dispatch, SetStateAction, useState } from "react";
import { LuPrinter } from "react-icons/lu";
import CancelButton from "./CancelButton";
import { useSession } from "next-auth/react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { OrderView } from "./transaction/cashier/CashierAction";
import { useOrderModal } from "@/lib/store/useOrderModal";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { handlePrint } from "@/lib/printUtlis";

interface OrderDetailsModalProps {
  isOrderModalOpen?: boolean;
  selectedOrder?: OrderView | null;
  setIsOrderModalOpen?: Dispatch<SetStateAction<boolean>>;
  hasPrint?: boolean;
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

  return (
    <>
      {/* this covers both manual (table) + global (notification) opening */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
        <div
          className="print:block bg-white w-full max-w-[500px] max-h-[95vh] rounded-md relative overflow-auto p-4"
          id="print-section"
        >
          <div className="space-y-2 text-sm w-full">
            <div className="flex justify-between items-center border-b-2 border-gray-100 pb-2 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-2">
                  <p className="text-lg font-semibold">{currentOrder.id}</p>
                  <p className="font-semibold">Order details</p>
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
              {currentOrder.source !== "Walk In" ? (
                <div className="flex  justify-between">
                  <div>
                    <p className="mt-2 font-semibold">
                      Patient Name:{" "}
                      <span className="font-normal">
                        {" "}
                        {currentOrder.patient_name}
                      </span>
                    </p>

                    <p className="mt-2 font-semibold">
                      Room Number:
                      <span className="font-normal">
                        {" "}
                        {currentOrder.roomNumber}
                      </span>
                    </p>

                    <p className="mt-2 font-semibold">
                      Created At:{" "}
                      <span className="font-normal">
                        {new Date(currentOrder.createdAt).toLocaleString(
                          "en-PH",
                          {
                            timeZone: "Asia/Manila",
                          }
                        )}
                      </span>
                    </p>

                    <p className="mt-2 font-semibold">
                      Type:{" "}
                      <span className="font-normal">
                        {" "}
                        {currentOrder.type === "EMERGENCY"
                          ? "Pay Later"
                          : currentOrder.type === "REGULAR"
                          ? "Regular"
                          : "Regular"}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <p className="font-semibold">Customer Name:</p>
                    <p>{currentOrder.customer}</p>
                  </div>
                  <div>
                    <p className="mt-2 font-semibold">
                      Type:{"  "}
                      <span className="font-normal"> {currentOrder.type}</span>
                    </p>
                  </div>
                  <p className="mt-2 font-semibold">
                    Created At:{" "}
                    <span className="font-normal">
                      {new Date(currentOrder.createdAt).toLocaleString(
                        "en-PH",
                        {
                          timeZone: "Asia/Manila",
                        }
                      )}
                    </span>
                  </p>
                </div>
              )}
            </div>
            <div className="border-t-2 pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]" colSpan={2}>
                      Product
                    </TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(currentOrder?.itemDetails) &&
                  currentOrder.itemDetails.length > 0 ? (
                    currentOrder.itemDetails.map(
                      (item: OrderItem, index: number) => {
                        const quantity = item.quantity;
                        const price = item.price ?? 0;
                        const subTotal = quantity * price;

                        return (
                          <TableRow key={index}>
                            <TableCell>
                              {capitalLetter(item.productName)}
                            </TableCell>
                            <TableCell colSpan={2}>{item.quantity}</TableCell>
                            <TableCell className="text-right">
                              {`₱${subTotal.toFixed(2)}`}
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No items found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right">
                      ₱
                      {currentOrder.itemDetails
                        .reduce((total, item) => {
                          const price = item.price ?? 0;

                          return total + item.quantity * price;
                        }, 0)
                        .toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
            {currentOrder.notes && currentOrder.notes?.length > 0 ? (
              <div className="border p-2 bg-slate-50 rounded-md shadow-sm print:hidden">
                <p className="font-semibold mb-2">Notes:</p>
                <p>{currentOrder.notes}</p>
              </div>
            ) : null}
            {currentOrder.source === "Walk In" ? null : (
              <div>
                <p className="mt-2 font-semibold">
                  Requested By:{" "}
                  <span className="font-normal">
                    {currentOrder.requestedBy}
                  </span>
                </p>

                {(currentOrder.status === "paid" ||
                  currentOrder.status === "for_payment") && (
                  <p className="mt-2 font-semibold">
                    Received By:{" "}
                    <span className="font-normal">
                      {currentOrder.receivedBy}
                    </span>
                  </p>
                )}

                {currentOrder.status === "paid" && (
                  <p className="mt-2 font-semibold">
                    Payment Processed By:{" "}
                    <span className="font-normal">
                      {currentOrder.processedBy}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Buttons */}
            {session?.user.role === "Pharmacist_Staff" &&
              currentOrder.status === "pending" &&
              hasPrint && (
                <div className="flex justify-end mt-4 print:hidden gap-4">
                  <CancelButton setIsModalOpen={handleClose} />
                  <button
                    onClick={() => {
                      if (!selectedOrder) return;
                      handlePrint(selectedOrder, setIsConfirmOpen);
                    }}
                    className="bg-buttonBgColor hover:bg-buttonHover text-white px-8 py-2 rounded-md flex items-center gap-2"
                  >
                    <LuPrinter />
                    Print
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Confirm Print Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-md w-[90%] max-w-sm flex items-start flex-col">
            <h2 className="text-lg font-semibold mb-2">Confirm Print</h2>
            <p className="text-sm text-gray-600 mb-4 text-start">
              Did the receipt print successfully?
            </p>
            <div className="flex gap-2 justify-end w-full mt-4">
              <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
                No
              </Button>
              <Button
                onClick={async () => {
                  setIsConfirmOpen(false);
                  if (!currentOrder) return;

                  try {
                    await fetch(
                      `/api/request_order/${currentOrder.id}/status`,
                      {
                        method: "PUT",
                        body: JSON.stringify({ status: "for_payment" }),
                        headers: { "Content-Type": "application/json" },
                      }
                    );

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
                    console.error(
                      "Failed to update status after printing",
                      error
                    );
                  }
                }}
                className="bg-buttonBgColor hover:bg-buttonHover text-white"
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetailsModal;
