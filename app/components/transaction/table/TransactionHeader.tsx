"use client";

import { TableHead } from "@/components/ui/table";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { LuArrowDownUp } from "react-icons/lu";
import ReusableTableHeader from "../../ui/ReusabaleTableHeader";

const TransactionTableHeader = ({ userRole }: { userRole: string }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  return (
    <ReusableTableHeader
      headers={[
        { key: "number", label: "No.", sortable: true },
        { key: "customer_name", label: "Customer Name", sortable: true },
        { key: "createdAt", label: "Created At", sortable: true },
        { key: "quantity", label: "Quantity", sortable: true },
        { key: "total", label: "Total Price", sortable: true },
      ]}
      extraHeaders={
        <>
          <TableHead className="text-black font-semibold">
            {userRole === "Nurse" ? (
              <p>Type</p>
            ) : (
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
            )}
          </TableHead>
          <TableHead className="text-black font-semibold">
            Request Order Type
          </TableHead>

          <TableHead className="text-black font-semibold">Status</TableHead>
          <TableHead className="text-black font-semibold text-right w-[120px]">
            Actions
          </TableHead>
        </>
      }
    />
  );
};

export default TransactionTableHeader;
