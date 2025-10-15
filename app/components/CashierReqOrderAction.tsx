import { IoMdCheckmark, IoMdEye, IoMdClose } from "react-icons/io";
import { MdOutlineEdit } from "react-icons/md";
import ActionButton from "./ActionButton";
import { Button } from "@/components/ui/button";
import { useModal } from "../hooks/useModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useTransition } from "react";
import RequestOrderEdit from "./RequestOrderEdit";
import { OrderView } from "./transaction/cashier/CashierAction";
import { IoArchiveOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import UserStatusConfirmDialog from "./UserStatusConfirmDialog";
import LoadingButton from "@/components/loading-button";

const CashierReqOrderAction = ({
  onView,
  status,
  showCheckbox,
  userRole,
  orderData,
}: {
  onView: () => void;
  status: string;
  showCheckbox?: boolean;
  userRole?: string;
  orderData?: OrderView;
}) => {
  const { open, close, isOpen } = useModal();
  const [showRequestEditModal, setShowRequestEditModal] = useState(false);

  const handleCheckmarkClick = () => {
    open();
  };

  const queryClient = useQueryClient();

  const [isLoading, startTransition] = useTransition();

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

  return (
    <div className="flex gap-2 justify-end">
      {status === "paid" || status === "pending" ? (
        <ActionButton
          icon={IoMdEye}
          onClick={onView}
          color="hover:bg-slate-300"
        />
      ) : (
        <>
          <ActionButton
            icon={IoMdEye}
            onClick={onView}
            color="hover:bg-slate-300"
          />
          {showCheckbox && userRole === "Cashier" && (
            <ActionButton
              icon={IoMdCheckmark}
              color="hover:bg-green-300"
              onClick={handleCheckmarkClick}
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
                : "hover:bg-red-300"
            }`}
          />
          {orderData?.status !== "canceled" ? (
            <ActionButton
              icon={IoMdClose}
              onClick={handleCheckmarkClick}
              color={` ${
                orderData?.status !== "pending"
                  ? "cursor-not-allowed text-gray-300"
                  : "hover:bg-red-300"
              }`}
            />
          ) : (
            <>
              {/* <ActionButton
                icon={IoArchiveOutline}
                onClick={handleCheckmarkClick}
                color="hover:bg-slate-300"
              /> */}
              <UserStatusConfirmDialog
                iconOnly={true}
                iconColor="text-gray-900 border p-1 rounded-md text-2xl hover:bg-slate-300"
                modalButtonLabel={
                  isLoading ? <LoadingButton color="text-white" /> : "Confirm"
                }
                buttonLabel="Archive"
                icon={IoArchiveOutline}
                title="Archive Order Request"
                description="Are you sure you want to
                archive this order?"
                confirmButton={handleArchive}
              />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 ">
          <div className="bg-white p-6 rounded-lg shadow-md w-[90%] max-w-sm flex items-start flex-col">
            <h2 className="text-lg font-semibold mb-2">Confirm Payment</h2>
            <p className="text-sm text-gray-600 mb-4 text-start">
              Are you sure you want to mark this order as <strong>Paid</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end w-full mt-4">
              <Button variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button
                onClick={() => mutate("paid")}
                className="bg-green-700 hover:bg-green-600 text-white"
                disabled={isPending}
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  "Confirm"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isOpen && userRole === "Nurse" && orderData?.status === "pending" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-md w-[90%] max-w-sm flex items-start flex-col">
            <h2 className="text-lg font-semibold mb-2">Cancel Request</h2>
            <p className="text-sm text-gray-600 mb-4 text-start">
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>
            <div className="flex gap-2 justify-end w-full mt-4">
              <Button variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button
                onClick={() => mutate("canceled")}
                className="bg-red-700 hover:bg-red-600 text-white"
                disabled={isPending}
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  "Confirm"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierReqOrderAction;
