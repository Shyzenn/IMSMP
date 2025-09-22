"use client";

import { useModal } from "@/app/hooks/useModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";
import { CiEdit } from "react-icons/ci";
import { IoArchiveOutline } from "react-icons/io5";
import { BatchProps } from "./BatchTable";
import EditBatchForm from "./EditBatchForm";

const BatchAction = ({ batch }: { batch: BatchProps }) => {
  const { open, close, isOpen } = useModal();

  return (
    <>
      {isOpen && <EditBatchForm batches={batch} setIsModalOpen={close} />}

      <div className="flex text-xl gap-2">
        <TooltipProvider>
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

          <Tooltip>
            <TooltipTrigger asChild>
              <button>
                <IoArchiveOutline />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Archive Batch</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
};

export default BatchAction;
