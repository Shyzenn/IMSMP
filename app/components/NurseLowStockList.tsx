"use client";

import { Column } from "@/lib/interfaces";
import React from "react";
import TableComponent from "./TableComponent";
import { useQuery } from "@tanstack/react-query";
import { fetchLowStocks } from "@/lib/action";

const columns: Column[] = [
  { label: "Medicine", accessor: "productName" },
  { label: "Stock Left", accessor: "quantity", align: "right" },
];

const NurseLowStockList = () => {
  const {
    data: lowStocks = [],
    isLoading,
    isError,
  } = useQuery({
    queryFn: fetchLowStocks,
    queryKey: ["low_stock"],
  });

  if (isLoading) return <p>Loading products...</p>;
  if (isError) return <p>Failed to load products.</p>;

  return (
    <div className="bg-white w-[40%] rounded-md h-full">
      <div className="max-h-[260px] overflow-auto mx-4">
        <TableComponent
          data={lowStocks}
          columns={columns}
          title="Low Stock List"
          interactiveRows={false}
          noDataMessage={lowStocks.length === 0 ? "No Low Stock" : undefined}
        />
      </div>
    </div>
  );
};

export default NurseLowStockList;
