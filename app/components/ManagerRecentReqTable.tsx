"use client";

import React, { useMemo, useState } from "react";
import TableComponent from "./TableComponent";
import { columns, fetchOrderRequest, formattedDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import OrderDetailsModal from "./OrderDetailsModal";
import { Order } from "@/lib/interfaces";

const ManagerRecentReqTable = () => {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const {
    data: orderRequest = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["request_order"],
    queryFn: fetchOrderRequest,
    refetchInterval: 5000,
  });

  const formattedData = useMemo(
    () =>
      orderRequest.map((order) => ({
        ...order,
        createdAt: formattedDate(order.createdAt),
      })),
    [orderRequest]
  );

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error fetching product</p>;

  return (
    <div className="mx-4 h-[200px] 2xl:h-[400px] overflow-auto">
      <TableComponent
        data={formattedData}
        columns={columns}
        setIsOrderModalOpen={setIsOrderModalOpen}
        onRowClick={(row) => setSelectedOrder(row)}
      />

      <OrderDetailsModal
        isOrderModalOpen={isOrderModalOpen}
        setIsOrderModalOpen={setIsOrderModalOpen}
        selectedOrder={selectedOrder}
      />
    </div>
  );
};

export default ManagerRecentReqTable;
