"use client";

import { formattedDateTime } from "@/lib/utils";
import { OrderItem } from "@/lib/interfaces";
import { useEmergencyModal } from "@/lib/store/emergency-modal";
import { MdAddAlert } from "react-icons/md";
import CancelButton from "./CancelButton";
import { LuPrinter } from "react-icons/lu";
import { handleEmergencyPrint } from "@/lib/printUtlis";

export default function EmergencyOrderModal() {
  const { isOpen, orderData, closeModal } = useEmergencyModal();

  if (!isOpen || !orderData) return null;

  const { order, sender, createdAt, notes } = orderData;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35">
        <div
          id="print-section"
          className="bg-white max-w-lg w-full p-6 border-t-8 border-red-600 rounded-2xl shadow-2xl print:block"
        >
          <div className="text-2xl font-bold text-red-600 flex items-center gap-2 justify-center">
            <MdAddAlert className="print:hidden alert_bell" />
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <p className="font-semibold text-center text-xl">Emergency Order</p>

            <div className="border rounded-lg p-3 bg-gray-50">
              <p className="font-semibold text-lg mb-2">{`ORD-0${order.id}`}</p>
              <p>
                <span className="font-semibold">Patient:</span>{" "}
                {order.patient_name}
              </p>
              <p>
                <span className="font-semibold">Room:</span> {order.room_number}
              </p>
              <p>
                <span className="font-semibold">Requested by:</span>{" "}
                {sender.username}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formattedDateTime(createdAt)}
              </p>
            </div>

            {order.products?.length > 0 && (
              <div>
                <p className="font-semibold mb-1">Requested Items:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {order.products.map((p: OrderItem, idx: number) => (
                    <li key={idx}>
                      {p.productName} —{" "}
                      <span className="font-medium">{p.quantity}</span> pcs
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {notes.length > 0 ? (
              <div className="border rounded-lg p-3">
                <p className="font-semibold text-lg">Notes:</p>
                {notes}
              </div>
            ) : null}
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
                <button
                  onClick={() => handleEmergencyPrint(orderData, closeModal)}
                  className="bg-buttonBgColor hover:bg-buttonHover text-white px-8 py-2 rounded-md flex items-center gap-2"
                >
                  <LuPrinter />
                  Print
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
