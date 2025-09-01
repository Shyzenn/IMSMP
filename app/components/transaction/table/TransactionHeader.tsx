"use client";

import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { LuArrowDownUp } from "react-icons/lu";

const sortableTableHeaders = [
  { key: "number", label: "No." },
  { key: "customer_name", label: "Customer Name" },
  { key: "createdAt", label: "Created At" },
  { key: "quantity", label: "Quantity" },
  { key: "total", label: "Total Price" },
];

const TransactionTableHeader = () => {
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
        {sortableTableHeaders.map(({ key, label }) => (
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
        <TableHead className="text-black font-semibold">
          <button
            className="flex gap-2 items-center"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              const currentFilter = params.get("filter");

              const nextFilter =
                currentFilter === "walk_in" ? "request_order" : "walk_in";
              params.set("filter", nextFilter);
              params.set("page", "1");

              router.push(`?${params.toString()}`);
            }}
          >
            Type
            <LuArrowDownUp />
          </button>
        </TableHead>

        <TableHead className="text-black font-semibold">Status</TableHead>
        <TableHead className="text-black font-semibold">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default TransactionTableHeader;
