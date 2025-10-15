"use client";

import { CiEdit } from "react-icons/ci";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IoArchiveOutline } from "react-icons/io5";
import { GiRecycle } from "react-icons/gi";
import EditProductForm from "./EditProductForm";
import { useModal } from "@/app/hooks/useModal";
import { useState, useTransition } from "react";
import ReplenishFormModal from "../../ReplenishFormModal";
import { ProductProps } from "./InventoryTable";
import UserStatusConfirmDialog from "../../UserStatusConfirmDialog";
import toast from "react-hot-toast";
import LoadingButton from "@/components/loading-button";
import { archiveProduct } from "@/lib/action/product";

const Action = ({ product }: { product: ProductProps }) => {
  const { open, close, isOpen } = useModal();

  const [showReplenishModal, setShowReplenishModal] = useState(false);

  const [isPending, startTransition] = useTransition();

  const handleArchive = () => {
    startTransition(async () => {
      const result = await archiveProduct(product.id);

      if (result.success) {
        toast.success(result.message + " ✅");
      } else {
        toast.error(result.message + " ❌");
      }
    });
  };

  return (
    <>
      {isOpen && <EditProductForm setIsModalOpen={close} product={product} />}

      <div className="flex text-xl gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={open}>
                <CiEdit />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit Product</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => setShowReplenishModal((prev) => !prev)}>
                <GiRecycle />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Replenish Product</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <UserStatusConfirmDialog
                iconOnly={true}
                iconColor="text-gray-900"
                modalButtonLabel={
                  isPending ? <LoadingButton color="text-white" /> : "Confirm"
                }
                buttonLabel="Archive"
                icon={IoArchiveOutline}
                title="Archive Product"
                description="Are you sure you want to
                archive this product?"
                confirmButton={handleArchive}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Archive Product</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {showReplenishModal && (
        <ReplenishFormModal
          setShowReplenishModal={setShowReplenishModal}
          productId={product.id}
        />
      )}
    </>
  );
};

export default Action;
