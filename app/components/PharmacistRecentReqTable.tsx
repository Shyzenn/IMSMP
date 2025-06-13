"use client";

import React, { useMemo, useState } from "react";
import TableComponent from "./TableComponent";
import { columns, formattedDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import OrderDetailsModal from "./OrderDetailsModal";
import { Order } from "@/lib/interfaces";
import { fetchOrderRequest } from "@/lib/action";

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

  if (isError) return <p>Error fetching product</p>;

  return (
    <div className="mx-4 min-h-[300px] max-h-[300px] overflow-auto">
      {isLoading ? (
        "Loading..."
      ) : (
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
      )}
    </div>
  );
};

export default ManagerRecentReqTable;
