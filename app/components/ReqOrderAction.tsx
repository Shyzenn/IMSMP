import { IoMdCheckmark, IoMdEye, IoMdClose } from "react-icons/io";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { GoPackageDependents } from "react-icons/go";
import { CiPill } from "react-icons/ci";
import { MdOutlineEdit } from "react-icons/md";
import ActionButton from "./ActionButton";
import { useModal } from "../hooks/useModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useTransition } from "react";
import RequestOrderEdit from "./RequestOrderEdit";
import { OrderView } from "./transaction/cashier/CashierAction";
import { IoArchiveOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import ConfirmationModal from "./ConfirmationModal";

const ReqOrderAction = ({
  onView,
  status,
  showCheckbox,
  userRole,
  orderData,
  remarks,
}: {
  onView: () => void;
  status: string;
  showCheckbox?: boolean;
  userRole?: string;
  orderData?: OrderView;
  remarks?: string;
}) => {
  const { open, close, isOpen } = useModal();
  const [showRequestEditModal, setShowRequestEditModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showPreparedModal, setShowPreparedModal] = useState(false);
  const [showDispensedModal, setShowDispensedModal] = useState(false);
  const [isNotPaid, setIsNotPaid] = useState(false);

  const queryClient = useQueryClient();

  const [isLoading, startTransition] = useTransition();

  // Archive Request Order
  const handleArchive = async () => {
    if (!orderData) {
      toast.error("No order data found ❌");
      return;
    }

    startTransition(async () => {
      try {
        const numericId =
          typeof orderData.id === "string"
            ? parseInt(orderData.id.replace(/\D/g, ""), 10)
            : orderData.id;

        if (isNaN(numericId)) {
          toast.error("Invalid order ID ❌");
          return;
        }

        const res = await fetch(`/api/request_order/${numericId}/archived`, {
          method: "PUT",
        });

        const result = await res.json();

        if (result.success) {
          toast.success(result.message + " ✅");
          queryClient.invalidateQueries({ queryKey: ["request_order"] });
        } else {
          toast.error(result.message + " ❌");
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong ❌");
      }
    });
  };

  // Paid and Canceled
  const { mutate, isPending } = useMutation({
    mutationFn: async (newStatus: "paid" | "canceled") => {
      if (!orderData) {
        toast.error("No order data found ❌");
        return;
      }

      const id = orderData.id;
      const res = await fetch(`/api/request_order/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request_order"] });
      queryClient.invalidateQueries({ queryKey: ["request_order/sales"] });
      close();
    },
    onError: (error) => console.error("Update failed:", error),
  });

  const { mutate: updateRemarks, isPending: isUpdatingRemarks } = useMutation({
    mutationFn: async (newRemarks: "prepared" | "dispensed") => {
      if (!orderData) {
        toast.error("No order data found ❌");
        return;
      }

      const res = await fetch(`/api/request_order/${orderData?.id}/remarks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remarks: newRemarks }),
      });
      if (!res.ok) throw new Error("Failed to update remarks");
      return res.json();
    },
    onSuccess: (result) => {
      toast.success(result.message + " ✅");
      queryClient.invalidateQueries({ queryKey: ["request_order"] });
      setShowPreparedModal(false);
      setShowDispensedModal(false);
    },
    onError: (error) => console.error("Something went wrong ❌", error),
  });

  return (
    <div className="flex gap-2 justify-end">
      {status === "paid" || status === "pending" ? (
        <ActionButton
          icon={IoMdEye}
          onClick={onView}
          color={`hover:bg-slate-200 ${
            userRole === "Pharmacist_Staff" ? "text-[16px] px-2" : ""
          }`}
        />
      ) : (
        <>
          <ActionButton
            icon={IoMdEye}
            onClick={onView}
            color={`hover:bg-slate-200 ${
              userRole === "Pharmacist_Staff" ? "text-[16px] px-2" : ""
            }`}
          />
          {showCheckbox && userRole === "Cashier" && (
            <ActionButton
              icon={IoMdCheckmark}
              color="hover:bg-green-200"
              onClick={open}
            />
          )}
        </>
      )}

      {userRole === "Pharmacist_Staff" && (
        <>
          {remarks === "Preparing" ? (
            <button
              className="border flex items-center justify-center gap-2 rounded-md px-2 hover:bg-slate-100 py-2 w-[11rem]"
              onClick={() => setShowPreparedModal(true)}
            >
              <CiPill className="text-blue-500 text-lg" />
              Mark as Prepared
            </button>
          ) : remarks === "Prepared" ? (
            <button
              className="border flex items-center justify-center gap-2 rounded-md px-2 hover:bg-slate-100 py-2 w-[11rem]"
              onClick={() => {
                if (status === "paid") {
                  setShowDispensedModal(true);
                } else {
                  setIsNotPaid(true);
                }
              }}
            >
              <GoPackageDependents className="text-orange-500 text-lg" />
              Mark as Dispensed
            </button>
          ) : (
            <div className="border flex items-center justify-center gap-2 rounded-md px-2 py-2 bg-gray-50 w-[11rem]">
              <IoMdCheckmarkCircleOutline className="text-green-500 text-lg" />
              Dispensed
            </div>
          )}
          {showPreparedModal && (
            <ConfirmationModal
              hasConfirmButton={true}
              defaultBtnColor={true}
              title={`${"Mark as Prepared"}`}
              description={`${"Are you sure you want to mark this order as prepared?"}`}
              onClick={() => updateRemarks("prepared")}
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
                    mark this order as dispensed?"
              onClick={() => updateRemarks("dispensed")}
              isPending={isUpdatingRemarks}
              closeModal={() => setShowDispensedModal(false)}
            />
          )}

          {isNotPaid && status !== "paid" && (
            <ConfirmationModal
              hasConfirmButton={false}
              defaultBtnColor={true}
              title={`${"Payment Required"}`}
              description={`${"This order has not been paid yet. Please settle the payment before dispensing"}`}
              closeModal={() => setIsNotPaid(false)}
            />
          )}
        </>
      )}

      {userRole === "Nurse" && (
        <>
          <ActionButton
            icon={MdOutlineEdit}
            onClick={() => setShowRequestEditModal(true)}
            color={` ${
              orderData?.status === "canceled"
                ? "cursor-not-allowed text-gray-300"
                : "hover:bg-slate-200"
            }`}
          />
          {orderData?.status !== "canceled" ? (
            <ActionButton
              icon={IoMdClose}
              onClick={open}
              color={` ${
                orderData?.status !== "pending"
                  ? "cursor-not-allowed text-gray-300"
                  : "hover:bg-red-300"
              }`}
            />
          ) : (
            <>
              <ActionButton
                icon={IoArchiveOutline}
                onClick={() => setShowArchiveModal(true)}
                color="hover:bg-slate-300"
              />
              {showArchiveModal && (
                <ConfirmationModal
                  hasConfirmButton={true}
                  defaultBtnColor={true}
                  title="Archive Order Request"
                  description="Are you sure you want to
                archive this order?"
                  onClick={() => handleArchive()}
                  isPending={isLoading}
                  closeModal={close}
                />
              )}
            </>
          )}
        </>
      )}

      {showRequestEditModal && orderData?.status !== "canceled" && (
        <RequestOrderEdit
          setShowRequestEditModal={setShowRequestEditModal}
          orderData={orderData}
        />
      )}

      {isOpen && userRole === "Cashier" && (
        <ConfirmationModal
          hasConfirmButton={true}
          defaultBtnColor={true}
          title="Confirm Payment"
          description=" Are you sure you want to mark this order as Paid?
               This action cannot be undone."
          onClick={() => mutate("paid")}
          isPending={isPending}
          closeModal={close}
        />
      )}

      {isOpen && userRole === "Nurse" && orderData?.status === "pending" && (
        <ConfirmationModal
          hasConfirmButton={true}
          defaultBtnColor={false}
          title="Cancel Request"
          description=" Are you sure you want to cancel this order? This action cannot be
              undone."
          onClick={() => mutate("canceled")}
          isPending={isPending}
          closeModal={close}
        />
      )}
    </div>
  );
};

export default ReqOrderAction;
