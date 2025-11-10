"use client";

import { capitalLetter, formattedDateTime, toTitleCase } from "@/lib/utils";
import { OrderItem } from "@/lib/interfaces";
import { useEmergencyModal } from "@/lib/store/emergency-modal";
import { MdAddAlert } from "react-icons/md";
import CancelButton from "./CancelButton";
import { LuPrinter } from "react-icons/lu";
import { handleEmergencyPrint } from "@/lib/printUtlis";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function EmergencyOrderModal() {
  const { isOpen, orderData, closeModal } = useEmergencyModal();

  const { data: session } = useSession();
  const userRole = session?.user.role;

  if (!isOpen || !orderData) return null;

  const { order, sender, createdAt, notes } = orderData;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
        <div
          id="print-section"
          className="bg-white max-w-lg w-full p-6 border-t-8 border-red-600 rounded-2xl shadow-2xl print:block overflow-auto max-h-[95vh]"
        >
          <div className="text-2xl font-bold text-red-600 flex items-center gap-2 justify-center">
            <MdAddAlert className="print:hidden alert_bell" />
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <p className="font-semibold text-center text-xl">Emergency Order</p>

            <div className="border rounded-lg p-3 bg-gray-50">
              <p className="font-semibold text-lg mb-2">{`ORD-0${order.id}`}</p>
              <p>
                <span className="font-semibold">Patient Name:</span>{" "}
                {toTitleCase(order.patient_name)}
              </p>
              <p>
                <span className="font-semibold">Room Number:</span>{" "}
                {order.room_number}
              </p>
              <p>
                <span className="font-semibold">Requested by:</span>{" "}
                {sender.username}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formattedDateTime(createdAt)}
              </p>
            </div>
            {notes.length > 0 ? (
              <div className="border rounded-lg p-3">
                <p className="font-semibold text-lg">Notes:</p>
                {notes}
              </div>
            ) : null}
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
                {Array.isArray(order?.products) && order.products.length > 0 ? (
                  order.products.map((item: OrderItem, index: number) => {
                    const quantity = item.quantity;
                    const price = item.price ?? 0;
                    const subTotal = quantity * price;

                    return (
                      <TableRow key={index}>
                        <TableCell>{capitalLetter(item.productName)}</TableCell>
                        <TableCell colSpan={2}>{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {`₱${subTotal.toFixed(2)}`}
                        </TableCell>
                      </TableRow>
                    );
                  })
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
                    {order.products
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

          <div className="flex justify-end mt-4 print:hidden gap-4">
            {order.status === "paid" ? (
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
                    onClick={() => handleEmergencyPrint(orderData, closeModal)}
                    className="bg-buttonBgColor hover:bg-buttonHover text-white px-8 py-2 rounded-md flex items-center gap-2"
                  >
                    <LuPrinter />
                    Print
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
