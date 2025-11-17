"use client";

import { OrderItem } from "@/lib/interfaces";
import { capitalLetter, toTitleCase } from "@/lib/utils";
import React, { Dispatch, SetStateAction } from "react";
import CancelButton from "./CancelButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import LoadingButton from "@/components/loading-button";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type RequestView = {
  id: number | string;
  requestedBy?: { username: string } | null;
  receivedBy?: { username: string } | null;
  approvedBy: { username: string } | null;
  notes?: string;
  quantity: number;
  remarks?: "processing" | "ready" | "released";
  status: "pending_for_approval" | "approved" | "declined";
  createdAt: Date;
  itemDetails: OrderItem[];
};

interface MedTechRequestDetailsModalProps {
  isRequestModalOpen?: boolean;
  selectedRequest?: RequestView | null;
  setIsOrderModalOpen: Dispatch<SetStateAction<boolean>>;
}

const MedTechRequestDetailsModal: React.FC<MedTechRequestDetailsModalProps> = ({
  isRequestModalOpen,
  selectedRequest,
  setIsOrderModalOpen,
}) => {
  const { data: session } = useSession();
  const userRole = session?.user.role;
  const queryClient = useQueryClient();
  const [clickedButton, setClickedButton] = React.useState<
    "approved" | "declined" | null
  >(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async (newStatus: "approved" | "declined") => {
      if (!selectedRequest) {
        toast.error("No order data found ❌");
        return;
      }

      const id = selectedRequest.id;
      const res = await fetch(`/api/medtech_request/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: (result) => {
      toast.success(result.message + " ✅", { duration: 10000 });
      queryClient.invalidateQueries({ queryKey: ["medtech_request"] });
      setClickedButton(null);
      setIsOrderModalOpen(false);
      close();
    },
    onError: (error) => {
      console.error("Update failed:", error);
      setClickedButton(null);
    },
  });

  if (!isRequestModalOpen || !selectedRequest) return null;

  const handleClose = () => {
    if (setIsOrderModalOpen) setIsOrderModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div
        className="bg-white w-full max-w-[500px] max-h-[95vh] rounded-md relative overflow-auto p-4"
        id="print-section"
      >
        <div className="flex flex-col gap-4 text-sm w-full">
          {/* Header */}
          <div className="flex justify-between items-center border-b-2 border-gray-100 pb-2 w-full">
            <div className="flex items-baseline justify-between w-full">
              <div className="flex flex-col gap-2">
                <p className="text-lg font-semibold text-start">
                  REQ-0{selectedRequest.id}
                </p>
                <p className="font-semibold">MedTech Request Details</p>
              </div>

              {/* Status Badge */}
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedRequest.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : selectedRequest.status === "pending_for_approval"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedRequest.status === "approved"
                    ? "Approved"
                    : selectedRequest.status === "pending_for_approval"
                    ? "Pending"
                    : "Declined"}
                </span>
              </div>
            </div>
          </div>

          {/* Request Info */}
          <div className="flex flex-col gap-2 pb-2">
            <p className="font-semibold  text-start">
              Created At:{" "}
              <span className="font-normal">
                {new Date(selectedRequest.createdAt).toLocaleString("en-PH", {
                  timeZone: "Asia/Manila",
                })}
              </span>
            </p>

            <p className="font-semibold  text-start">
              Remarks:{" "}
              <span className="font-normal">
                {selectedRequest.remarks === "processing"
                  ? "Processing"
                  : selectedRequest.remarks === "ready"
                  ? "Ready for Pickup"
                  : "Released"}
              </span>
            </p>
          </div>

          {/* Items Table */}
          <div className="border-t-2 pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(selectedRequest?.itemDetails) &&
                selectedRequest.itemDetails.length > 0 ? (
                  selectedRequest.itemDetails.map((item, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell>{capitalLetter(item.productName)}</TableCell>
                        <TableCell className="text-center">
                          {item.quantity}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No items found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Notes */}
          {selectedRequest.notes && selectedRequest.notes?.length > 0 && (
            <div className="border p-3 bg-slate-50 rounded-md shadow-sm  text-start">
              <p className="font-semibold mb-2">Notes:</p>
              <p className="text-gray-700">{selectedRequest.notes}</p>
            </div>
          )}

          {/* User Information */}
          <div className="border-t-2 pt-4 space-y-2">
            <p className="font-semibold  text-start">
              Requested By:{" "}
              <span className="font-normal">
                {selectedRequest.requestedBy?.username
                  ? toTitleCase(selectedRequest.requestedBy?.username)
                  : "Unknown"}
              </span>
            </p>

            <p className="font-semibold  text-start">
              Received By:{" "}
              <span className="font-normal">
                {selectedRequest.receivedBy?.username
                  ? toTitleCase(selectedRequest.receivedBy?.username)
                  : "Unknown"}
              </span>
            </p>

            <p className="font-semibold  text-start">
              Approved By:{" "}
              <span className="font-normal">
                {selectedRequest.approvedBy?.username
                  ? toTitleCase(selectedRequest.approvedBy?.username)
                  : "Unknown"}
              </span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <CancelButton setIsModalOpen={handleClose} />
            {userRole === "Manager" &&
              selectedRequest.status === "pending_for_approval" && (
                <>
                  <Button
                    className="bg-red-500 hover:bg-red-400 text-white"
                    onClick={() => {
                      setClickedButton("declined");
                      mutate("declined");
                    }}
                    disabled={isPending}
                  >
                    {isPending && clickedButton === "declined" ? (
                      <LoadingButton color="text-white" />
                    ) : (
                      " Decline Request"
                    )}
                  </Button>
                  <Button
                    className="bg-buttonBgColor hover:bg-buttonHover text-white"
                    onClick={() => {
                      setClickedButton("approved");
                      mutate("approved");
                    }}
                    disabled={isPending}
                  >
                    {isPending && clickedButton === "approved" ? (
                      <LoadingButton color="text-white" />
                    ) : (
                      " Approve Request"
                    )}
                  </Button>
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedTechRequestDetailsModal;
