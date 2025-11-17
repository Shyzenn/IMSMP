"use client";

import { TableHead } from "@/components/ui/table";
import React from "react";
import ReusableTableHeader from "../../ReusabaleTableHeader";

const MTTransactionTableHeader = () => {
  return (
    <ReusableTableHeader
      headers={[
        { key: "number", label: "No.", sortable: true },
        { key: "createdAt", label: "Created At", sortable: true },
        { key: "requestedBy", label: "Requested By", sortable: false },
        { key: "receivedBy", label: "Received By", sortable: false },
        { key: "approvedBy", label: "Approved By", sortable: false },
        { key: "quantity", label: "Quantity", sortable: true },
      ]}
      extraHeaders={
        <>
          <TableHead className="text-black font-semibold">Status</TableHead>
          <TableHead className="text-black font-semibold">Remarks</TableHead>
          <TableHead className="text-black font-semibold text-right w-[120px]">
            Actions
          </TableHead>
        </>
      }
    />
  );
};

export default MTTransactionTableHeader;
