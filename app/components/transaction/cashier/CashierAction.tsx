"use client";

import React, { useState } from "react";
import CashierReqOrderAction from "../../CashierReqOrderAction";
import OrderDetailsModal from "../../OrderDetailsModal";
import { CombinedTransaction } from "@/lib/action/get";
import { OrderItem } from "@/lib/interfaces";

export type OrderView = {
  id: string;
  customer?: string;
  patient_name?: string;
  roomNumber?: string;
  quantity: number;
  price: number;
  total: number;
  status: string;
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
        orderId={transaction.id.toString()}
        status={transaction.status}
        onView={() => {
          const orderView: OrderView = {
            ...transaction,
            id: `ORD-${transaction.id}`,
            patient_name: transaction.patient_name ?? "N/A",
            roomNumber: transaction.roomNumber?.toString() ?? "N/A",
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
