import { Order, OrderItem } from "@/lib/interfaces";
import { capitalLetter } from "@/lib/utils";
import React, { Dispatch, SetStateAction } from "react";
import { IoIosClose } from "react-icons/io";

const OrderDetailsModal = ({
  isOrderModalOpen,
  selectedOrder,
  setIsOrderModalOpen,
}: {
  isOrderModalOpen: boolean;
  selectedOrder: Order | null;
  setIsOrderModalOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <>
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
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
              <div className="flex flex-col gap-5 w-[80%] pb-2">
                <div className="flex justify-between mt-4 ">
                  <p>Created At:</p>
                  <p className="font-semibold">{selectedOrder.createdAt}</p>
                </div>
                <div className="flex justify-between">
                  <p>Patient Name:</p>
                  <p className="font-semibold">{selectedOrder.patient_name}</p>
                </div>
                <div className="flex justify-between">
                  <p>Status:</p>
                  <p className="font-semibold">{selectedOrder.status}</p>
                </div>
              </div>
              <div className="border-t-2 pt-4">
                <p className="font-semibold text-lg mb-4">Items:</p>
                {Array.isArray(selectedOrder.itemDetails) ? (
                  <ul className="list-disc list-inside flex flex-col gap-4">
                    {selectedOrder.itemDetails.map(
                      (item: OrderItem, index: number) => (
                        <li key={index} className="list-none border-b-2 pb-2">
                          {capitalLetter(item.productName)}, x{item.quantity}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p>No items available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetailsModal;
