import React from "react";
import { FiPrinter, FiX } from "react-icons/fi";
import Modal from "../ui/Modal";

interface PrintConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const PrintConfirmationModal: React.FC<PrintConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <Modal onClose={onCancel} isOpen={isOpen} width="max-w-sm">
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
          <FiPrinter className="text-green-600 text-3xl" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
        Print Confirmation
      </h2>

      {/* Message */}
      <p className="text-center text-gray-600 mb-6">
        Did you successfully print the receipt?
      </p>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <FiX className="text-xl" />
          No
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <FiPrinter className="text-xl" />
          Yes
        </button>
      </div>

      {/* Info text */}
      <p className="text-xs text-center text-gray-500 mt-4">
        If you printed the receipt, click &quot;Yes, I Printed&quot; to complete
        the payment.
      </p>
    </Modal>
  );
};

export default PrintConfirmationModal;
