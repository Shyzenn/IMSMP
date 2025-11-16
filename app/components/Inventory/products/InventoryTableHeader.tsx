"use client";

import { TableHead } from "@/components/ui/table";
import React from "react";
import ReusableTableHeader from "../../ReusabaleTableHeader";

const InventoryTableHeader = ({ hasAction }: { hasAction: boolean }) => {
  return (
    <ReusableTableHeader
      headers={[
        { key: "number", label: "No.", sortable: false },
        { key: "product_name", label: "Product", sortable: true },
        { key: "totalQuantity", label: "Quantity(Total)", sortable: true },
        { key: "price", label: "Price", sortable: true },
        { key: "createdAt", label: "Created At", sortable: true },
        { key: "expiringSoon", label: "Expiring Soon", sortable: true },
        { key: "totalBatches", label: "Total Batches", sortable: true },
      ]}
      extraHeaders={
        <>
          <TableHead className="text-black font-semibold">Category</TableHead>
          {hasAction && (
            <TableHead className="text-black font-semibold">Actions</TableHead>
          )}
        </>
      }
    />
  );
};

export default InventoryTableHeader;
