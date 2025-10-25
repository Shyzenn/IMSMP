"use client";

import React, { useMemo, useState } from "react";
import TableComponent from "./TableComponent";
import { formattedDateTime } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import OrderDetailsModal from "./OrderDetailsModal";
import { Column } from "@/lib/interfaces";
import { CheckCircle, Clock } from "lucide-react";
import axios from "axios";
import { RecentRequestOrderSkeleton } from "./Skeleton";
import LoadingButton from "@/components/loading-button";
import CashierReqOrderAction from "./CashierReqOrderAction";
import { OrderView } from "./transaction/cashier/CashierAction";
import { FcCancel } from "react-icons/fc";
import Pagination from "./Pagination";
import SelectField from "./SelectField";
import { OrderRequest } from "@prisma/client";

export const fetchOrderRequest = async (
  page = 1,
  limit = 5,
  filter = "all"
) => {
  const res = await axios.get("/api/request_order", {
    params: { page, limit, filter },
  });
  return res.data;
};

export const baseColumns: Column[] = [
  { label: "Order ID", accessor: "id" },
  { label: "Customer Name", accessor: "patient_name" },
  { label: "Date Placed", accessor: "createdAt" },
  { label: "Items", accessor: "items" },
  {
    label: "Type",
    accessor: "type",
    render: (row) => {
      const { type } = row as { type: string };
      const isEmergency = type.toLowerCase() === "emergency";
      return (
        <span
          className={`font-semibold 
           "text-gray-800
          `}
        >
          {isEmergency ? "Pay Later" : type}
        </span>
      );
    },
  },
  { label: "Remarks", accessor: "remarks" },
  {
    label: "Status",
    accessor: "status",
    render: (row) => {
      const { status } = row as { status: string };

      const displayStatus =
        status === "for_payment"
          ? "For Payment"
          : status === "paid"
          ? "Paid"
          : status === "pending"
          ? "Pending"
          : "Canceled";

      let bg = "bg-gray-100";
      let text = "text-gray-700";
      let icon = <Clock className="w-4 h-4 text-gray-500" />;

      if (displayStatus === "Paid") {
        bg = "bg-green-100";
        text = "text-green-700";
        icon = <CheckCircle className="w-4 h-4 text-green-500" />;
      } else if (displayStatus === "For Payment") {
        bg = "bg-yellow-100";
        text = "text-yellow-700";
        icon = <LoadingButton color="text-yellow-400" />;
      } else if (displayStatus === "Canceled") {
        bg = "bg-red-100";
        text = "text-red-700";
        icon = <FcCancel className="text-xl" />;
      }

      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${bg} ${text}`}
        >
          {displayStatus}
          {icon}
        </span>
      );
    },
  },
];

type FilterOption = "All" | "Pending" | "For Payment" | "Paid" | "Cancelled";

const ManagerRecentReqTable = ({ userRole }: { userRole?: string }) => {
  const [filter, setFilter] = useState<
    "All" | "Pending" | "For Payment" | "Paid" | "Cancelled"
  >("All");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderView | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["request_order", page, filter],
    queryFn: () => fetchOrderRequest(page, itemsPerPage, filter),
    refetchInterval: 5000,
  });

  const orderRequest = useMemo(() => data?.data || [], [data]);
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  const formattedData = useMemo(() => {
    return orderRequest.map((order: OrderRequest) => ({
      ...order,
      id: `ORD-0${order.id}`,
      createdAt: formattedDateTime(order.createdAt),
    }));
  }, [orderRequest]);

  const columns: Column[] = useMemo(() => {
    if (userRole === "Cashier" || userRole === "Nurse") {
      return [
        ...baseColumns,
        {
          label: "Action",
          accessor: "action",
          align: "right",
          render: (row) => {
            const originalOrder = formattedData.find(
              (o: OrderRequest) => o.id === row.id
            );
            if (!originalOrder) return null;

            return (
              <CashierReqOrderAction
                orderData={originalOrder}
                userRole={userRole}
                showCheckbox={true}
                onView={() => {
                  setSelectedOrder(originalOrder);
                  setIsOrderModalOpen(true);
                }}
                status={originalOrder.status}
              />
            );
          },
        },
      ];
    }
    return baseColumns;
  }, [userRole, formattedData]);

  if (isLoading) return <RecentRequestOrderSkeleton />;

  return (
    <div className="mx-4">
      <TableComponent
        largeContainer={true}
        title="Recent Order Request"
        data={formattedData}
        columns={columns}
        setIsOrderModalOpen={setIsOrderModalOpen}
        onRowClick={(row) => setSelectedOrder(row as OrderView)}
        interactiveRows={true}
        noDataMessage={
          orderRequest.length === 0 ? "No Recent Order" : undefined
        }
        filter={
          <SelectField
            label={filter}
            option={[
              { label: "All", value: "All" },
              { label: "Pending", value: "pending" },
              { label: "For Payment", value: "for_payment" },
              { label: "Paid", value: "paid" },
              { label: "Canceled", value: "canceled" },
            ]}
            value={filter}
            onChange={(val) => {
              setFilter(val as FilterOption);
              setPage(1);
            }}
          />
        }
      />

      <div className="flex justify-center md:justify-between items-center mt-4 w-full pb-2">
        <p className="text-sm text-gray-500 hidden md:block">
          Showing <span className="font-semibold">{formattedData.length}</span>{" "}
          of <span className="font-semibold">{total}</span> Results
        </p>

        <div className="mb-4 md:mb-0">
          <Pagination
            totalPages={totalPages}
            currentPage={page}
            onPageChange={setPage}
            isComponent={true}
          />
        </div>
      </div>

      <OrderDetailsModal
        isOrderModalOpen={isOrderModalOpen}
        setIsOrderModalOpen={setIsOrderModalOpen}
        selectedOrder={selectedOrder}
        hasPrint={true}
      />
    </div>
  );
};

export default ManagerRecentReqTable;
