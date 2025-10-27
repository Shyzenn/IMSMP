"use client";

import React, { useState } from "react";
import CashierReqOrderAction from "../../ReqOrderAction";
import OrderDetailsModal from "../../OrderDetailsModal";
import { CombinedTransaction } from "@/lib/action/get";
import { OrderItem } from "@/lib/interfaces";

export type OrderView = {
  type?: "REGULAR" | "EMERGENCY";
  id: number | string;
  requestedBy?: string;
  receivedBy?: string;
  processedBy?: string;
  customer?: string;
  patient_name?: string;
  roomNumber?: string;
  notes?: string;
  quantity: number;
  price: number;
  total: number;
  remarks?: "preparing" | "prepared" | "dispensed";
  status: "pending" | "for_payment" | "paid" | "canceled";
  createdAt: Date;
  source: "Walk In" | "Request Order";
  itemDetails: OrderItem[];
};

const CashierAction = ({
  transaction,
}: {
  transaction: CombinedTransaction;
}) => {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderView | null>(null);

  return (
    <>
      <CashierReqOrderAction
        status={transaction.status}
        onView={() => {
          const orderView: OrderView = {
            ...transaction,
            id: `ORD-${transaction.id}`,
            patient_name: transaction.patient_name ?? "N/A",
            roomNumber: transaction.roomNumber?.toString() ?? "N/A",
            status: transaction.status as
              | "pending"
              | "for_payment"
              | "paid"
              | "canceled",
          };
          setSelectedOrder(orderView);
          setIsOrderModalOpen(true);
        }}
      />

      <OrderDetailsModal
        isOrderModalOpen={isOrderModalOpen}
        setIsOrderModalOpen={setIsOrderModalOpen}
        selectedOrder={selectedOrder}
        hasPrint={true}
      />
    </>
  );
};

export default CashierAction;
