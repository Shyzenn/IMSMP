import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import React, { useState } from "react";

interface ConfirmationModalProps {
  title: string;
  description: string;
  onClick?: (reason?: string) => void;
  isPending?: boolean;
  closeModal: () => void;
  defaultBtnColor: boolean;
  hasConfirmButton: boolean;
  hasReason?: boolean;
  reasonValue?: string | null;
  isRefund?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  description,
  onClick,
  isPending,
  closeModal,
  defaultBtnColor,
  hasConfirmButton,
  hasReason,
  isRefund,
}) => {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 ">
      <div className="bg-white p-6 rounded-lg shadow-md w-[90%] max-w-sm flex items-start flex-col">
        <h2 className="text-lg font-semibold mb-2 text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600 mb-4 text-start">{description}</p>
        {hasReason && (
          <>
            <p>{`Reason for ${isRefund ? "refunding" : "archiving"}:`}</p>
            <Textarea
              placeholder="Enter your reason here..."
              onChange={(e) => setReason(e.target.value)}
              value={reason}
            />
          </>
        )}
        <div className="flex gap-2 justify-end w-full mt-4">
          <Button
            variant="outline"
            onClick={closeModal}
            className="text-gray-900"
          >
            {hasConfirmButton ? "Cancel" : "Close"}
          </Button>
          {hasConfirmButton ? (
            <Button
              onClick={() => onClick?.(reason)}
              className={`text-white ${
                defaultBtnColor
                  ? "bg-buttonBgColor hover:bg-buttonHover"
                  : "bg-red-600 hover:bg-red-500"
              }`}
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
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
