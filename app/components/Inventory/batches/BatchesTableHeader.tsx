"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React from "react";
import { LuArrowDownUp } from "react-icons/lu";
import { useSession } from "next-auth/react";

const sortableHeaders = [
  { key: "number", label: "No." },
  { key: "product_name", label: "Product" },
  { key: "batch_number", label: "Batch Number" },
  { key: "quantity", label: "Quantity" },
  { key: "release_date", label: "Release Date" },
  { key: "expiry_date", label: "Expiry Date" },
];

const BatchesTableHeader = () => {
  const { data: session } = useSession();
  const userRole = session?.user.role;
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentSort = searchParams.get("sort") || "product_name";
  const currentOrder = searchParams.get("order") || "asc";

  const handleSort = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (currentSort === key) {
      params.set("order", currentOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sort", key);
      params.set("order", "asc");
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <TableHeader>
      <TableRow className="bg-slate-100">
        {sortableHeaders.map(({ key, label }) => (
          <TableHead key={key} className="text-black font-semibold">
            <button
              className="flex gap-2 items-center"
              onClick={() => handleSort(key)}
            >
              {label}
              <LuArrowDownUp />
            </button>
          </TableHead>
        ))}
        <TableHead className="text-black font-semibold">Status</TableHead>
        {(userRole === "Manager" || userRole === "Pharmacist_Staff") && (
          <TableHead className="text-black font-semibold">Actions</TableHead>
        )}
      </TableRow>
    </TableHeader>
  );
};

export default BatchesTableHeader;
