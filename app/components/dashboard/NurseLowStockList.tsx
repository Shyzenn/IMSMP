"use client";

import { Column } from "@/lib/interfaces";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ExpiryProductsSkeleton } from "../ui/Skeleton";
import TableComponent from "../ui/TableComponent";

const columns: Column[] = [
  { label: "Medicine", accessor: "productName" },
  { label: "Stock Left", accessor: "quantity", align: "right" },
];

const fetchLowStocks = async () => {
  const { data } = await axios.get("api/low_stock");
  return Array.isArray(data) ? data : [];
};

const NurseLowStockList = () => {
  const { data: lowStocks = [], isLoading } = useQuery({
    queryFn: fetchLowStocks,
    queryKey: ["low_stock"],
  });

  if (isLoading) return <ExpiryProductsSkeleton />;

  return (
    <div className="mx-4 max-h-[240px] overflow-auto">
      <div className="max-h-[230px] overflow-auto mx-4">
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
