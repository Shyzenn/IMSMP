import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useState } from "react";
import ActionButton from "./ActionButton";
import { RequestView } from "./MTRequestDetails";
import { IoMdCheckmarkCircleOutline, IoMdEye } from "react-icons/io";
import { CiPill } from "react-icons/ci";
import { GoPackageDependents } from "react-icons/go";
import ConfirmationModal from "./ConfirmationModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { TbCancel } from "react-icons/tb";

const MTReqAction = ({
  onView,
  status,
  userRole,
  orderData,
  remarks,
}: {
  onView: () => void;
  status: string;
  userRole?: string;
  orderData?: RequestView;
  remarks?: string;
}) => {
  const [showPreparedModal, setShowPreparedModal] = useState(false);
  const [showDispensedModal, setShowDispensedModal] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const queryClient = useQueryClient();

  const { mutate: updateRemarks, isPending: isUpdatingRemarks } = useMutation({
    mutationFn: async (newRemarks: "ready" | "released") => {
      if (!orderData) {
        toast.error("No order data found ❌");
        return;
      }

      const res = await fetch(`/api/medtech_request/${orderData?.id}/remarks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remarks: newRemarks }),
      });
      if (!res.ok) throw new Error("Failed to update remarks");
      return res.json();
    },
    onSuccess: (result) => {
      toast.success(result.message + " ✅", { duration: 10000 });
      queryClient.invalidateQueries({ queryKey: ["medtech_request"] });
      setShowPreparedModal(false);
      setShowDispensedModal(false);
    },
    onError: (error) => console.error("Something went wrong ❌", error),
  });

  return (
    <div className="text-right">
      <TooltipProvider>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <ActionButton
                  icon={IoMdEye}
                  onClick={onView}
                  color={`hover:bg-slate-200 ${
                    userRole === "Pharmacist_Staff"
                      ? "text-[16px] px-2 py-[8px]"
                      : ""
                  }`}
                />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Order</p>
            </TooltipContent>
          </Tooltip>
          {userRole === "Pharmacist_Staff" && (
            <>
              {status === "declined" ? (
                <div className="border flex items-center justify-center gap-2 rounded-md px-2 py-2 bg-gray-50 w-[11rem] text-gray-500">
                  Declined
                  <TbCancel className="text-red-300 text-lg" />
                </div>
              ) : remarks === "processing" ? (
                <button
                  className="border flex items-center justify-center gap-2 rounded-md px-2 hover:bg-slate-100 py-2 w-[11rem]"
                  onClick={() => setShowPreparedModal(true)}
                >
                  Mark as Prepared
                  <CiPill className="text-blue-500 text-lg" />
                </button>
              ) : remarks === "ready" ? (
                <button
                  className="border flex items-center justify-center gap-2 rounded-md px-2 hover:bg-slate-100 py-2 w-[11rem]"
                  onClick={() => {
                    if (status === "approved") {
                      setShowDispensedModal(true);
                    } else {
                      setIsApproved(true);
                    }
                  }}
                >
                  Mark as Dispensed
                  <GoPackageDependents className="text-orange-500 text-lg" />
                </button>
              ) : (
                <div className="border flex items-center justify-center gap-2 rounded-md px-2 py-2 bg-gray-50 w-[11rem] text-gray-500">
                  Dispensed
                  <IoMdCheckmarkCircleOutline className="text-green-300 text-lg" />
                </div>
              )}

              {showPreparedModal && (
                <ConfirmationModal
                  hasConfirmButton={true}
                  defaultBtnColor={true}
                  title={`${"Mark as Prepared"}`}
                  description={`${"Are you sure you want to mark this request as prepared?"}`}
                  onClick={() => updateRemarks("ready")}
                  isPending={isUpdatingRemarks}
                  closeModal={() => setShowPreparedModal(false)}
                />
              )}
              {showDispensedModal && (
                <ConfirmationModal
                  hasConfirmButton={true}
                  defaultBtnColor={true}
                  title="Mark as Dispensed"
                  description="Are you sure you want to
                    mark this request as dispensed?"
                  onClick={() => updateRemarks("released")}
                  isPending={isUpdatingRemarks}
                  closeModal={() => setShowDispensedModal(false)}
                />
              )}
              {isApproved && status !== "approved" && (
                <ConfirmationModal
                  hasConfirmButton={false}
                  defaultBtnColor={true}
                  title={`${"Approval Required"}`}
                  description={`${"This request has not been approve yet. Please wait for manager for approval."}`}
                  closeModal={() => setIsApproved(false)}
                />
              )}
            </>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default MTReqAction;
