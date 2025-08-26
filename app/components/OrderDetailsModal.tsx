import { Order, OrderItem } from "@/lib/interfaces";
import { capitalLetter } from "@/lib/utils";
import React, { Dispatch, SetStateAction } from "react";
import { LuPrinter } from "react-icons/lu";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CancelButton from "./CancelButton";
import { useSession } from "next-auth/react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { useQueryClient } from "@tanstack/react-query";

const OrderDetailsModal = ({
  isOrderModalOpen,
  selectedOrder,
  setIsOrderModalOpen,
  hasPrint,
}: {
  isOrderModalOpen: boolean;
  selectedOrder: Order | null;
  setIsOrderModalOpen: Dispatch<SetStateAction<boolean>>;
  hasPrint?: boolean;
}) => {
  const { data: session } = useSession();
  const userRole = session?.user.role;

  const queryClient = useQueryClient();

  const handlePrint = async () => {
    window.print();

    const didPrint = confirm("Did the receipt print successfully?");
    if (!didPrint || !selectedOrder) return;

    const numericId = parseInt(selectedOrder.id.replace("ORD-", ""));
    try {
      await fetch(`/api/request_order/${numericId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "for_payment" }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      await fetch("/api/audit-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "Order Printed",
          entityType: "Order",
          entityId: selectedOrder.id,
          description: `${userRole} prints the order ${selectedOrder.id}`,
        }),
      });

      queryClient.invalidateQueries({ queryKey: ["request_order"] });
      queryClient.invalidateQueries({ queryKey: ["order_cards"] });
      queryClient.invalidateQueries({ queryKey: ["salesData", "This Year"] });

      selectedOrder.status = "For Payment";
      setIsOrderModalOpen(false);
    } catch (error) {
      console.error("Failed to update status after printing", error);
    }
  };

  return (
    <>
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div
            className="print:block bg-white w-full max-w-[500px] max-h-[95vh] rounded-md relative overflow-auto p-4"
            id="print-section"
          >
            <div className="space-y-2 text-sm w-full">
              <div className="flex justify-between items-center border-b-2 border-gray-100 pb-2 w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col gap-2">
                    <p className="text-lg font-semibold">{selectedOrder.id}</p>
                    <p className="">Order details</p>
                  </div>
                  {(userRole === "Cashier" ||
                    userRole === "Manager" ||
                    userRole === "Nurse") && (
                    <button onClick={() => setIsOrderModalOpen(false)}>
                      <IoIosCloseCircleOutline className="text-2xl text-red-500" />
                    </button>
                  )}

                  {userRole === "Pharmacist_Staff" &&
                    selectedOrder.status !== "Pending" && (
                      <button onClick={() => setIsOrderModalOpen(false)}>
                        <IoIosCloseCircleOutline className="text-2xl text-red-500" />
                      </button>
                    )}
                </div>
              </div>
              <div className="flex flex-col gap-5 pb-2">
                <div className="flex gap-2">
                  <p>Patient Name:</p>
                  <p className="font-semibold">{selectedOrder.patient_name}</p>
                </div>
                <div className="flex gap-2">
                  <p>Room Number:</p>
                  <p className="font-semibold">{selectedOrder.roomNumber}</p>
                </div>
                <div className="flex gap-2">
                  <p>Created At:</p>
                  <p className="font-semibold">{selectedOrder.createdAt}</p>
                </div>

                <div className="flex gap-2">
                  <p>Status:</p>
                  <p className="font-semibold">{selectedOrder.status}</p>
                </div>
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
                    {Array.isArray(selectedOrder?.itemDetails) &&
                    selectedOrder.itemDetails.length > 0 ? (
                      selectedOrder.itemDetails.map(
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
                        {selectedOrder.itemDetails
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
              {session?.user.role === "Pharmacist_Staff" &&
                selectedOrder.status === "Pending" && (
                  <div className="flex justify-end">
                    {hasPrint && (
                      <div className="flex justify-end mt-4 print:hidden gap-4">
                        <CancelButton setIsModalOpen={setIsOrderModalOpen} />
                        <button
                          onClick={handlePrint}
                          className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-md flex items-center gap-2"
                        >
                          <LuPrinter />
                          Print
                        </button>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetailsModal;
