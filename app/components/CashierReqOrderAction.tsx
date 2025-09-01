import { IoMdCheckmark, IoMdEye } from "react-icons/io";
import ActionButton from "./ActionButton";
import { Button } from "@/components/ui/button";
import { useModal } from "../hooks/useModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const CashierReqOrderAction = ({
  onView,
  orderId,
  status,
  showCheckbox,
}: {
  onView: () => void;
  orderId: string;
  status: string;
  showCheckbox?: boolean;
}) => {
  const { open, close, isOpen } = useModal();

  const handleCheckmarkClick = () => {
    console.log("✅ Checkmark clicked - Order ID:", orderId);
    open();
  };

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const numericId = parseInt(orderId.replace("ORD-", ""));
      const res = await fetch(`/api/request_order/${numericId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "paid" }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request_order"] });
      queryClient.invalidateQueries({ queryKey: ["request_order/sales"] });
      close();
    },
    onError: (error) => {
      console.error("Update failed:", error);
    },
  });

  return (
    <div className="flex gap-2 justify-end">
      {status === "Paid" || status === "Pending" ? (
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
          {showCheckbox && (
            <ActionButton
              icon={IoMdCheckmark}
              color="hover:bg-green-300"
              onClick={handleCheckmarkClick}
            />
          )}
        </>
      )}

      {/* <ConfirmationModal
        button={
        
        }
        submitButton={() => {
          console.log("Submit");
        }}
        title="Reject Payment"
        description="Are you sure you want to reject this payment? This action cannot be undone."
      /> */}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
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
                onClick={() => mutate()}
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
    </div>
  );
};

export default CashierReqOrderAction;
