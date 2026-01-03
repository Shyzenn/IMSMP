"use client";

import { TableHead } from "@/components/ui/table";
import React from "react";
import { useSession } from "next-auth/react";
import ReusableTableHeader from "../../ui/ReusabaleTableHeader";

const BatchesTableHeader = () => {
  const { data: session } = useSession();
  const userRole = session?.user.role;

  return (
    <ReusableTableHeader
      headers={[
        { key: "number", label: "No.", sortable: true },
        { key: "product_name", label: "Product", sortable: true },
        { key: "batch_number", label: "Batch Number", sortable: true },
        { key: "quantity", label: "Quantity", sortable: true },
        { key: "release_date", label: "Manufactured Date", sortable: true },
        { key: "expiry_date", label: "Expiry Date", sortable: true },
      ]}
      extraHeaders={
        <>
          <TableHead className="text-black font-semibold">Status</TableHead>
          {(userRole === "Manager" || userRole === "Pharmacist_Staff") && (
            <TableHead className="text-black font-semibold">Actions</TableHead>
          )}
        </>
      }
    />
  );
};

export default BatchesTableHeader;
