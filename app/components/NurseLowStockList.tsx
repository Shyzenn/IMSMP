"use client";

import { Column } from "@/lib/interfaces";
import React from "react";
import TableComponent from "./TableComponent";
import { useQuery } from "@tanstack/react-query";
import { fetchLowStocks } from "@/lib/utils";

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

  const formattedData = lowStocks.map((lowStock) => ({
    ...lowStock,
  }));

  if (isLoading) return <p>Loading products...</p>;
  if (isError) return <p>Failed to load products.</p>;

  return (
    <div className="bg-white w-[40%] rounded-md h-full">
      <div className="max-h-[180px] overflow-auto mx-4">
        <TableComponent
          data={formattedData}
          columns={columns}
          title="Low Stock List"
          interactiveRows={false}
        />
      </div>
    </div>
  );
};

export default NurseLowStockList;
