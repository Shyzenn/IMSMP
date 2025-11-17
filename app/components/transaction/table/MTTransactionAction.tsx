"use client";

import React, { useState } from "react";
import ActionButton from "../../ActionButton";
import { MTTransaction } from "@/lib/action/get";
import { IoMdEye } from "react-icons/io";
import MedTechRequestDetailsModal, {
  RequestView,
} from "../../MTRequestDetails";

interface MTTransactionActionProps {
  transaction: MTTransaction;
}

const MTTransactionAction = ({ transaction }: MTTransactionActionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestView | null>(
    null
  );

  const handleViewClick = () => {
    if (!transaction?.id) return;

    const requestView: RequestView = {
      id: transaction.id,
      requestedBy: transaction.requestedBy
        ? { username: transaction.requestedBy }
        : null,
      receivedBy: transaction.receivedBy
        ? { username: transaction.receivedBy }
        : null,
      approvedBy: transaction.approvedBy
        ? { username: transaction.approvedBy }
        : null,
      notes: transaction.notes ?? "",
      quantity: transaction.quantity,
      remarks:
        (transaction.remarks as "processing" | "ready" | "released") ??
        undefined,
      status: transaction.status as
        | "pending_for_approval"
        | "approved"
        | "declined",
      createdAt: new Date(transaction.createdAt),
      itemDetails: transaction.itemDetails.map((item) => ({
        productName: item.productName ?? "Unknown",
        quantity: item.quantity,
        price: item.price ?? 0,
      })),
    };

    setSelectedRequest(requestView);
    setIsModalOpen(true);
  };

  return (
    <>
      <ActionButton
        icon={IoMdEye}
        onClick={handleViewClick}
        color="hover:bg-slate-200 px-2"
        label="View"
      />

      {isModalOpen && selectedRequest && (
        <MedTechRequestDetailsModal
          isRequestModalOpen={isModalOpen}
          selectedRequest={selectedRequest}
          setIsOrderModalOpen={setIsModalOpen}
        />
      )}
    </>
  );
};

export default MTTransactionAction;
