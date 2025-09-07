import { UserFormValues } from "@/lib/interfaces";
import axios from "axios";
import React from "react";
import toast from "react-hot-toast";

interface ResetPasswordModalProps {
  showResetModal: boolean;
  setShowResetModal: React.Dispatch<React.SetStateAction<boolean>>;
  user: UserFormValues;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  setShowResetModal,
  user,
  showResetModal,
}) => {
  return (
    <>
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-[350px]">
            <p className="text-lg font-medium mb-2">Reset Password</p>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to reset this user’s password? A new OTP
              will be sent to their email.
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await axios.post("/api/user/reset-password", {
                      userId: user.id,
                    });
                    toast.success(
                      "Password reset. The new OTP has been sent to the user’s email."
                    );
                  } catch (error) {
                    console.error("Failed to reset password", error);
                    toast.error("Failed to reset password. Please try again.");
                  } finally {
                    setShowResetModal(false);
                  }
                }}
                className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResetPasswordModal;
