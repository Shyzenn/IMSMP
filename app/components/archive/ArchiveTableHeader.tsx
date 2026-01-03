"use client";

import { TableHead } from "@/components/ui/table";
import React from "react";
import { useSession } from "next-auth/react";
import ReusableTableHeader from "../ui/ReusabaleTableHeader";

const ArchiveTableHeader = () => {
  const { data: session } = useSession();
  const userRole = session?.user.role;

  const headers = [
    { key: "number", label: "No.", sortable: false },
    { key: "type", label: "Type", sortable: false },
    { key: "product_name", label: "Product", sortable: false },
    {
      key: "category_or_batch",
      label: "Category / Batch / Room",
      sortable: false,
    },
    { key: "quantity", label: "Quantity", sortable: false },
    { key: "release_date", label: "Release Date", sortable: false },
    { key: "expiry_date", label: "Expiry Date", sortable: false },
    { key: "archiveReason", label: "Reason", sortable: false },
    { key: "archived_at", label: "Archived At", sortable: false },
    { key: "archived_by", label: "Archived By", sortable: false },
  ];

  const showActions =
    userRole === "Manager" ||
    userRole === "Pharmacist_Staff" ||
    userRole === "Nurse";

  return (
    <ReusableTableHeader
      headers={headers}
      extraHeaders={
        <>
          {showActions && (
            <TableHead className="text-black font-semibold">Actions</TableHead>
          )}
        </>
      }
    />
  );
};

export default ArchiveTableHeader;
