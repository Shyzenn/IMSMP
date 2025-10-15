"use client";

import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { LuArrowUp, LuArrowDown, LuArrowDownUp } from "react-icons/lu";

type HeaderConfig = {
  key: string;
  label: string;
  sortable?: boolean;
};

type ReusableTableHeaderProps = {
  headers: HeaderConfig[];
  extraHeaders?: React.ReactNode;
};

const ReusableTableHeader = ({
  headers,
  extraHeaders,
}: ReusableTableHeaderProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentSort = searchParams.get("sort") || "createdAt";
  const currentOrder = searchParams.get("order") || "desc";

  const handleSort = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (currentSort === key) {
      params.set("order", currentOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sort", key);
      params.set("order", "desc");
    }

    router.push(`?${params.toString()}`);
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (currentSort !== columnKey) {
      return <LuArrowDownUp className="text-gray-400" />;
    }
    return currentOrder === "asc" ? (
      <LuArrowUp className="text-blue-600" />
    ) : (
      <LuArrowDown className="text-blue-600" />
    );
  };

  return (
    <TableHeader>
      <TableRow className="bg-slate-100">
        {headers.map(({ key, label, sortable }) => (
          <TableHead key={key} className="text-black font-semibold">
            {sortable ? (
              <button
                className="flex gap-2 items-center hover:text-blue-600 transition-colors"
                onClick={() => handleSort(key)}
              >
                {label}
                <SortIcon columnKey={key} />
              </button>
            ) : (
              label
            )}
          </TableHead>
        ))}
        {extraHeaders}
      </TableRow>
    </TableHeader>
  );
};

export default ReusableTableHeader;
