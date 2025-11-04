"use client";

import React, { useTransition } from "react";
import { restoreBatch, restoreProduct } from "@/lib/action/product";
import toast from "react-hot-toast";
import { LuArchiveRestore } from "react-icons/lu";
import { restoreOrderRequest } from "@/lib/action/order_request";
import ConfirmationModal from "../ConfirmationModal";
import { useModal } from "@/app/hooks/useModal";
import ActionButton from "../ActionButton";

type ArchiveActionProps = {
  item: {
    id: number;
    type: "Product" | "Product Batch" | "Order Request";
  };
};

const ArchiveAction = ({ item }: ArchiveActionProps) => {
  const { open, close, isOpen } = useModal();
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
    <>
      <ActionButton
        label="Restore"
        icon={LuArchiveRestore}
        onClick={open}
        color="hover:bg-slate-200 border-gray-300"
      />
      {isOpen && (
        <ConfirmationModal
          hasConfirmButton={true}
          title={`Restore ${item.type}`}
          description={`Are you sure you want to restore this ${item.type}?`}
          closeModal={close}
          defaultBtnColor={true}
          isPending={isPending}
          onClick={() => handleRestore()}
        />
      )}
    </>
  );
};

export default ArchiveAction;
