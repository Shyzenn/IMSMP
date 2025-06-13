import { Order, OrderItem } from "@/lib/interfaces";
import { capitalLetter } from "@/lib/utils";
import React, { Dispatch, SetStateAction } from "react";
import { IoIosClose } from "react-icons/io";
import { LuPrinter } from "react-icons/lu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  return (
    <>
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white w-full max-w-[500px] max-h-[95vh] rounded-md relative overflow-auto p-4">
            <div className="space-y-2 text-sm w-full">
              <div className="flex justify-between items-center border-b-2 border-gray-100 pb-2">
                <div className="flex flex-col gap-2">
                  <p className="text-lg font-semibold">{selectedOrder.id}</p>
                  <p className="">Order details</p>
                </div>
                <button onClick={() => setIsOrderModalOpen(false)}>
                  <IoIosClose className="text-2xl text-red-500 cursor-pointer" />
                </button>
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
                  <TableCaption>
                    A list of your recent request order.
                  </TableCaption>
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
              <div className="flex justify-end">
                {hasPrint ? (
                  <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-md flex items-center gap-2">
                    <LuPrinter />
                    Print
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetailsModal;
