"use client";

import { Column } from "@/lib/interfaces";
import React from "react";
import TableComponent from "./TableComponent";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const columns: Column[] = [
  { label: "Medicine", accessor: "productName" },
  { label: "Stock Left", accessor: "quantity", align: "right" },
];

const fetchLowStocks = async () => {
  const { data } = await axios.get("api/low_stock");
  return Array.isArray(data) ? data : [];
};

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
    <div className="bg-white w-[40%] rounded-md p-3 h-full">
      <p className="text-lg font-semibold mb-1">Low Stock List</p>
      <div className="max-h-[180px] overflow-auto">
        <TableComponent data={formattedData} columns={columns} />
      </div>
    </div>
  );
};

export default NurseLowStockList;
