import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface UserStatusConfirmDialogProps {
  title: string;
  description: string;
  confirmButton: (reason?: string) => void;
  closeModal?: () => void;
  hasConfirmButton?: boolean;
  bgRedButton?: boolean;
  defaultBtnColor?: boolean;
  modalButtonLabel?: React.ReactNode;
  hasReason?: boolean;
  readReason?: boolean;
  reasonValue?: string;
  isPending: boolean;
}

const UserStatusConfirmDialog = ({
  title,
  description,
  confirmButton,
  closeModal,
  hasConfirmButton = true,
  bgRedButton,
  defaultBtnColor,
  modalButtonLabel = "Confirm",
  hasReason,
  readReason,
  reasonValue,
  isPending,
}: UserStatusConfirmDialogProps) => {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-lg shadow-md w-[90%] max-w-sm flex flex-col">
        <h2 className="text-lg font-semibold mb-2 text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600 mb-4 text-start">{description}</p>

        {/* Reason section */}
        {hasReason && (
          <div className="w-full">
            <label className="text-sm text-gray-700 font-medium mb-1 block">
              Reason for banning:
            </label>
            {readReason ? (
              <p className="text-sm text-gray-600 bg-gray-100 rounded-md p-2">
                {reasonValue ? reasonValue : "No reason provided"}
              </p>
            ) : (
              <Textarea
                className="w-full border rounded-md p-2 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your reason here..."
                rows={3}
                readOnly={readReason}
                onChange={(e) => setReason(e.target.value)}
              />
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 justify-end w-full mt-4">
          <Button
            variant="outline"
            onClick={closeModal}
            className="text-gray-900"
          >
            {hasConfirmButton ? "Cancel" : "Close"}
          </Button>
          {hasConfirmButton && (
            <Button
              onClick={() => confirmButton(reason)}
              disabled={isPending}
              className={`text-white ${
                bgRedButton
                  ? "bg-red-600 hover:bg-red-500"
                  : defaultBtnColor
                  ? "bg-buttonBgColor hover:bg-buttonHover"
                  : "bg-buttonBgColor hover:bg-buttonHover"
              }`}
            >
              {modalButtonLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserStatusConfirmDialog;
