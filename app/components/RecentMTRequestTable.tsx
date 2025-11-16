"use client";

import React, { useMemo, useState } from "react";
import TableComponent from "./TableComponent";
import { formattedDateTime } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Column, OrderItem } from "@/lib/interfaces";
import { CheckCircle, Clock } from "lucide-react";
import axios from "axios";
import { RecentRequestOrderSkeleton } from "./Skeleton";
import LoadingButton from "@/components/loading-button";
import Pagination from "./Pagination";
import SelectField from "./SelectField";
import { FcCancel } from "react-icons/fc";
import MTReqAction from "./MTReqAction";
import MedTechRequestDetailsModal, { RequestView } from "./MTRequestDetails";

export const fetchMedTechRequest = async (
  page = 1,
  limit = 5,
  filter = "all"
) => {
  const res = await axios.get("/api/medtech_request", {
    params: { page, limit, filter },
  });
  return res.data;
};

export const baseColumns: Column[] = [
  { label: "Request ID", accessor: "id" },
  { label: "Date Placed", accessor: "createdAt" },
  {
    label: "Items",
    accessor: "items",
    render: (row) => {
      const items = row.items as OrderItem[];
      if (!items || items.length === 0) return "No items";

      // Show first item and count if multiple
      const firstItem = items[0];
      const itemText = `${firstItem.productName || "Unknown"} (x${
        firstItem.quantity
      })`;

      if (items.length > 1) {
        return `${itemText} +${items.length - 1} more`;
      }

      return itemText;
    },
  },
  { label: "Remarks", accessor: "remarks" },
  {
    label: "Status",
    accessor: "status",
    render: (row) => {
      const { status } = row as { status: string };

      const displayStatus =
        status === "declined"
          ? "Declined"
          : status === "approved"
          ? "Approved"
          : status === "pending_for_approval"
          ? "Pending for Approval"
          : "Unknown";

      let bg = "bg-gray-100";
      let text = "text-gray-700";
      let icon = <Clock className="w-4 h-4 text-gray-500" />;

      if (displayStatus === "Approved") {
        bg = "bg-green-100";
        text = "text-green-700";
        icon = <CheckCircle className="w-4 h-4 text-green-500" />;
      } else if (displayStatus === "Pending for Approval") {
        bg = "bg-yellow-100";
        text = "text-yellow-700";
        icon = <LoadingButton color="text-yellow-400" />;
      } else if (displayStatus === "Declined") {
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

type FilterOption = "all" | "pending_for_approval" | "approved" | "cancelled";

const RecentMedTechRequestTable = ({ userRole }: { userRole?: string }) => {
  const [filter, setFilter] = useState<FilterOption>("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedRequest, setSelectedRequest] = useState<RequestView | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["medtech_request", page, filter],
    queryFn: () => fetchMedTechRequest(page, itemsPerPage, filter),
    refetchInterval: 5000,
  });

  const medtechRequest = useMemo(() => data?.data || [], [data]);
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  const formattedData = useMemo(() => {
    return medtechRequest.map((request: RequestView) => ({
      ...request,
      id: `REQ-0${request.id}`,
      remarks:
        request.remarks === "processing"
          ? "Processing"
          : request.remarks === "ready"
          ? "Ready"
          : "Released",
      createdAt: formattedDateTime(request.createdAt),
      items: request.itemDetails,
      requestedBy: request.requestedBy,
      receivedBy: request.receivedBy,
      approvedBy: request.approvedBy,
    }));
  }, [medtechRequest]);

  const columns: Column[] = useMemo(() => {
    if (userRole !== "Manager") {
      return [
        ...baseColumns,
        {
          label: "Action",
          accessor: "action",
          align: "right",
          render: (row) => {
            const originalRequest = medtechRequest.find(
              (r: RequestView) => `REQ-0${r.id}` === row.id
            );
            if (!originalRequest) return null;

            return (
              <MTReqAction
                orderData={originalRequest}
                userRole={userRole}
                onView={() => {
                  setSelectedRequest(originalRequest);
                  setIsModalOpen(true);
                }}
                status={originalRequest.status}
                remarks={originalRequest.remarks}
              />
            );
          },
        },
      ];
    }
    return baseColumns;
  }, [userRole, medtechRequest]);

  if (isLoading) return <RecentRequestOrderSkeleton />;

  return (
    <div className="mx-4">
      <TableComponent
        largeContainer={true}
        title="Recent MedTech Requests"
        data={formattedData}
        columns={columns}
        onRowClick={(row) => {
          const originalRequest = medtechRequest.find(
            (r: RequestView) => `REQ-0${r.id}` === row.id
          );
          if (!originalRequest) return;

          setSelectedRequest(originalRequest);
          setIsModalOpen(true);
        }}
        interactiveRows={true}
        noDataMessage={
          medtechRequest.length === 0 ? "No Recent Requests" : undefined
        }
        filter={
          <SelectField
            label={
              filter === "all"
                ? "All"
                : filter === "pending_for_approval"
                ? "Pending"
                : filter === "approved"
                ? "Approved"
                : "Declined"
            }
            option={[
              { label: "All", value: "all" },
              { label: "Pending for Approval", value: "pending_for_approval" },
              { label: "Approved", value: "approved" },
              { label: "Declined", value: "declined" },
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
      <MedTechRequestDetailsModal
        isRequestModalOpen={isModalOpen}
        selectedRequest={selectedRequest}
        setIsOrderModalOpen={setIsModalOpen}
      />
    </div>
  );
};

export default RecentMedTechRequestTable;
