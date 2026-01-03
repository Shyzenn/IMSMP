"use client";

import { useModal } from "@/app/hooks/useModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useState, useTransition } from "react";
import { CiEdit } from "react-icons/ci";
import { IoArchiveOutline } from "react-icons/io5";
import { BatchProps } from "./BatchTable";
import EditBatchForm from "./EditBatchForm";
import { archiveBatch } from "@/lib/action/product";
import toast from "react-hot-toast";
import ConfirmationModal from "../../ui/ConfirmationModal";

const BatchAction = ({ batch }: { batch: BatchProps }) => {
  const { open, close, isOpen } = useModal();
  const [isPending, startTransition] = useTransition();
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  const handleArchive = (reason?: string) => {
    startTransition(async () => {
      const sanitizedReason = reason?.trim().replace(/\s+/g, " ") || "";

      if (!sanitizedReason || sanitizedReason.length < 5) {
        toast.error("Reason must be at least 5 characters", {
          duration: 5000,
        });
        return;
      }

      const result = await archiveBatch(batch.id, sanitizedReason);

      try {
        if (result.success)
          toast.success(result.message + " ✅", { duration: 10000 });
        setShowArchiveModal(false);
      } catch (error) {
        toast.error(result.message + "❌");
        console.error(error);
        setShowArchiveModal(false);
      } finally {
        setShowArchiveModal(false);
      }
    });
  };

  return (
    <>
      {isOpen && <EditBatchForm batches={batch} setIsModalOpen={close} />}
      <TooltipProvider>
        <div className="flex text-xl gap-2">
          {/* Edit button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={open}>
                <CiEdit />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit Batch</p>
            </TooltipContent>
          </Tooltip>

          {/* Archive button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <button onClick={() => setShowArchiveModal(true)}>
                  <IoArchiveOutline />
                </button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Archive Batch</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {showArchiveModal && (
        <ConfirmationModal
          hasReason={true}
          closeModal={() => setShowArchiveModal(false)}
          title={`Archive Batch (${batch.product.product_name}, ${batch.batchNumber})`}
          description="Are you sure you want to archive this batch?"
          onClick={handleArchive}
          defaultBtnColor
          hasConfirmButton
          isPending={isPending}
        />
      )}
    </>
  );
};

export default BatchAction;
