"use client";

import { IoMdEye } from "react-icons/io";
import { RiRefund2Line } from "react-icons/ri";
import { useModal } from "@/app/hooks/useModal";
import { useOrderModal } from "@/lib/store/useOrderModal";
import { useEmergencyModal } from "@/lib/store/emergency-modal";
import OrderDetailsModal from "../../OrderDetailsModal";
import EmergencyOrderModal from "../../EmergencyModal";
import ActionButton from "../../ActionButton";
import ConfirmationModal from "../../ConfirmationModal";
import { CombinedTransaction } from "@/lib/action/get";
import { EmergencyOrderModalData, OrderItem } from "@/lib/interfaces";
import { useTransition } from "react";
import toast from "react-hot-toast";

export type OrderView = {
  type: "REGULAR" | "EMERGENCY" | "Walk In";
  id: number | string;
  requestedBy: string;
  receivedBy: string;
  processedBy: string;
  customer: string;
  patient_name: string;
  roomNumber: string;
  notes: string;
  quantity: number;
  price: number;
  total: number;
  remarks?: "preparing" | "prepared" | "dispensed";
  status: "pending" | "for_payment" | "paid" | "canceled" | "refunded";
  createdAt: Date;
  source: "Walk In" | "Request Order";
  itemDetails: OrderItem[];
};

const CashierAction = ({
  transaction,
}: {
  transaction: CombinedTransaction;
}) => {
  const { openModal } = useOrderModal();
  const { openModal: openEmergencyModal } = useEmergencyModal();
  const { open, isOpen, close } = useModal();
  const [isPending, startTransition] = useTransition();

  const handleViewClick = async (transaction: CombinedTransaction) => {
    if (!transaction?.id) return;

    if (transaction.type === "EMERGENCY") {
      const payLaterData: EmergencyOrderModalData = {
        id: transaction.id,
        orderType: transaction.type,
        order: {
          id: transaction.id,
          patient_name: transaction.patient_name ?? "Unknown",
          room_number: transaction.roomNumber?.toString() ?? "Unknown",
          status: (["pending", "for_payment", "paid", "canceled"].includes(
            transaction.status
          )
            ? transaction.status
            : "pending") as EmergencyOrderModalData["order"]["status"],
          products: transaction.itemDetails.map((item) => ({
            productName: item.productName ?? "Unknown",
            quantity: item.quantity,
            price: item.price ?? 0,
          })),
        },
        createdAt: new Date(transaction.createdAt),
        notes: transaction.notes ?? "",
        sender: {
          username: transaction.requestedBy ?? "Unknown",
        },
      };
      openEmergencyModal(payLaterData);
      return;
    }

    if (transaction.type === "REGULAR" || transaction.type === "Walk In") {
      const orderView: OrderView = {
        id: `ORD-${transaction.id}`,
        type: transaction.type ?? "REGULAR",
        requestedBy: transaction.requestedBy ?? "Unknown",
        receivedBy: transaction.receivedBy ?? "Unknown",
        processedBy: transaction.processedBy ?? "Unknown",
        customer: transaction.patient_name ?? "Unknown",
        patient_name: transaction.patient_name ?? "Unknown",
        roomNumber: transaction.roomNumber?.toString() ?? "N/A",
        notes: transaction.notes ?? "",
        quantity: transaction?.itemDetails.reduce(
          (sum, i) => sum + i.quantity,
          0
        ),
        price: transaction.itemDetails?.reduce(
          (sum, i) => sum + (i.price ?? 0),
          0
        ),
        total: transaction.itemDetails?.reduce(
          (sum, i) => sum + i.quantity * (i.price ?? 0),
          0
        ),
        status: transaction.status as OrderView["status"],
        createdAt: new Date(transaction.createdAt),
        source: transaction.source,
        itemDetails: transaction.itemDetails.map((i) => ({
          productName: i.productName ?? "Unknown",
          quantity: i.quantity,
          price: i.price ?? 0,
        })),
      };

      openModal(orderView);
    }
  };

  const handleRefund = async () => {
    startTransition(async () => {
      try {
        let endpoint = "";

        // Determine the correct API endpoint based on transaction source
        if (transaction.source === "Walk In") {
          endpoint = `/api/walkin_order/${transaction.id}/refund`;
        } else {
          endpoint = `/api/request_order/${transaction.id}/status`;
        }

        const response = await fetch(endpoint, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "refunded" }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to refund transaction");
        }

        toast.success(
          transaction.source === "Walk In"
            ? "Walk-in transaction refunded successfully"
            : "Order refunded successfully"
        );
        close();

        // Refresh the page to show updated data
        window.location.reload();
      } catch (error) {
        console.error("Error refunding transaction:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to refund transaction"
        );
      }
    });
  };

  const getRefundTitle = () => {
    if (transaction.source === "Walk In") {
      return `Refund Walk-In Transaction (ORD-0${transaction.id})`;
    }
    return `Refund Order (ORD-${transaction.id})`;
  };

  const getRefundDescription = () => {
    return `Are you sure you want to refund this ${
      transaction.source === "Walk In" ? "walk-in transaction" : "order"
    } ? This action cannot be undone and will restore the inventory.`;
  };

  return (
    <>
      <div className="flex gap-2">
        {transaction.status === "paid" && (
          <ActionButton
            icon={RiRefund2Line}
            onClick={open}
            color="hover:bg-red-200 px-2"
            label="Refund"
          />
        )}
        <ActionButton
          icon={IoMdEye}
          onClick={() => handleViewClick(transaction)}
          color="hover:bg-slate-200 px-2"
          label="View"
        />
      </div>

      {isOpen && (
        <ConfirmationModal
          defaultBtnColor={false}
          title={getRefundTitle()}
          description={getRefundDescription()}
          onClick={handleRefund}
          isPending={isPending}
          closeModal={close}
        />
      )}

      {!openEmergencyModal && <OrderDetailsModal hasPrint={true} />}
      {!openModal && <EmergencyOrderModal />}
    </>
  );
};

export default CashierAction;
