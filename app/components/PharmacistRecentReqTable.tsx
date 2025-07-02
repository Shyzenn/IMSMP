"use client";

import React, { useMemo, useState } from "react";
import TableComponent from "./TableComponent";
import { relativeTime } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import OrderDetailsModal from "./OrderDetailsModal";
import { Column, Order } from "@/lib/interfaces";
import { CheckCircle, Clock, LoaderCircle } from "lucide-react";
import axios from "axios";
import { RecentRequestOrderSkeleton } from "./Skeleton";
export const columns: Column[] = [
  { label: "Order ID", accessor: "id" },
  { label: "Customer Name", accessor: "patient_name" },
  { label: "Date Placed", accessor: "createdAt" },
  { label: "Items", accessor: "items" },
  {
    label: "Status",
    accessor: "status",
    align: "right",
    render: (row) => {
      const status = row.status as string;
      let bg = "bg-gray-100";
      let text = "text-gray-700";
      let icon = <Clock className="w-4 h-4 text-gray-500" />;

      if (status === "Paid") {
        bg = "bg-green-100";
        text = "text-green-700";
        icon = <CheckCircle className="w-4 h-4 text-green-500" />;
      } else if (status === "For Payment") {
        bg = "bg-yellow-100";
        text = "text-yellow-700";
        icon = <LoaderCircle className="w-4 h-4 text-yellow-500" />;
      }

      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${bg} ${text}`}
        >
          {status}
          {icon}
        </span>
      );
    },
  },
];

export const fetchOrderRequest = async () => {
  const { data } = await axios.get("/api/request_order");
  return Array.isArray(data) ? data : [];
};

const ManagerRecentReqTable = () => {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orderRequest = [], isLoading } = useQuery({
    queryKey: ["request_order"],
    queryFn: fetchOrderRequest,
    refetchInterval: 5000,
  });

  const formattedData = useMemo(
    () =>
      orderRequest.map((order) => ({
        ...order,
        createdAt: relativeTime(order.createdAt),
      })),
    [orderRequest]
  );

  if (isLoading) return <RecentRequestOrderSkeleton />;

  return (
    <div className="mx-4 min-h-[280px] max-h-[280px] overflow-auto">
      <>
        <TableComponent
          title="Recent Order Request"
          data={formattedData}
          columns={columns}
          setIsOrderModalOpen={setIsOrderModalOpen}
          onRowClick={(row) => setSelectedOrder(row)}
          interactiveRows={true}
          noDataMessage={
            orderRequest.length === 0 ? "No Recent Order" : undefined
          }
        />

        <OrderDetailsModal
          isOrderModalOpen={isOrderModalOpen}
          setIsOrderModalOpen={setIsOrderModalOpen}
          selectedOrder={selectedOrder}
          hasPrint={true}
        />
      </>
    </div>
  );
};

export default ManagerRecentReqTable;
