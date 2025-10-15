"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useTransition } from "react";
import LoadingButton from "@/components/loading-button";
import { restoreBatch, restoreProduct } from "@/lib/action/product";
import toast from "react-hot-toast";
import UserStatusConfirmDialog from "../UserStatusConfirmDialog";
import { LuArchiveRestore } from "react-icons/lu";
import { restoreOrderRequest } from "@/lib/action/order_request";

type ArchiveActionProps = {
  item: {
    id: number;
    type: "Product" | "Product Batch" | "Order Request";
  };
};

const ArchiveAction = ({ item }: ArchiveActionProps) => {
  const [isPending, startTransition] = useTransition();

  const handleRestore = () => {
    startTransition(async () => {
      let result;
      switch (item.type) {
        case "Product":
          result = await restoreProduct(item.id);
          break;
        case "Product Batch":
          result = await restoreBatch(item.id);
          break;
        case "Order Request":
          result = await restoreOrderRequest(item.id);
          break;
        default:
          result = { success: false, message: "Unknown item type" };
      }

      if (result.success) {
        toast.success(result.message + " ✅");
      } else {
        toast.error(result.message + " ❌");
      }
    });
  };

  return (
    <div className="flex text-xl gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <UserStatusConfirmDialog
              iconOnly={true}
              iconColor="text-gray-900"
              modalButtonLabel={
                isPending ? <LoadingButton color="text-white" /> : "Confirm"
              }
              buttonLabel="Restore"
              icon={LuArchiveRestore}
              title={`Restore ${item.type}`}
              description={`Are you sure you want to restore this ${item.type}?`}
              confirmButton={handleRestore}
            />
          </TooltipTrigger>
          <TooltipContent>Restore {item.type}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ArchiveAction;
