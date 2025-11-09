"use client";
import { useModal } from "@/app/hooks/useModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useTransition } from "react";
import { CiEdit } from "react-icons/ci";
import { IoArchiveOutline } from "react-icons/io5";
import { BatchProps } from "./BatchTable";
import EditBatchForm from "./EditBatchForm";
import LoadingButton from "@/components/loading-button";
import UserStatusConfirmDialog from "../../UserStatusConfirmDialog";
import { archiveBatch } from "@/lib/action/product";
import toast from "react-hot-toast";

const BatchAction = ({ batch }: { batch: BatchProps }) => {
  const { open, close, isOpen } = useModal();
  const [isPending, startTransition] = useTransition();

  const handleArchive = () => {
    startTransition(async () => {
      const result = await archiveBatch(batch.id);
      if (result.success) toast.success(result.message + " ✅");
      else toast.error(result.message + " ❌");
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
              <span className="inline-flex">
                <UserStatusConfirmDialog
                  iconOnly={true}
                  iconColor="text-gray-900"
                  modalButtonLabel={
                    isPending ? <LoadingButton color="text-white" /> : "Confirm"
                  }
                  buttonLabel="Archive"
                  icon={IoArchiveOutline}
                  title="Archive Batch"
                  description="Are you sure you want to archive this batch?"
                  confirmButton={handleArchive}
                />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Archive Batch</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </>
  );
};

export default BatchAction;
