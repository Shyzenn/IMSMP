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
import ReplenishFormModal from "./ReplenishFormModal";
import { ProductProps } from "./InventoryTable";
import toast from "react-hot-toast";
import { archiveProduct } from "@/lib/action/product";
import ConfirmationModal from "../../ui/ConfirmationModal";
import { IoMdEye } from "react-icons/io";
import ProductDetailsModal from "./ProductDetailsModal";

const Action = ({ product }: { product: ProductProps }) => {
  const { open, close, isOpen } = useModal();

  const [showReplenishModal, setShowReplenishModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showProductDetailsModal, setShowProductDetailsModal] = useState(false);

  const [isPending, startTransition] = useTransition();

  const handleArchive = (reason?: string) => {
    startTransition(async () => {
      const sanitizedReason = reason?.trim().replace(/\s+/g, " ") || "";
      if (!sanitizedReason || sanitizedReason.length < 5) {
        toast.error("Reason must be at least 5 characters", {
          duration: 5000,
        });
        return;
      }

      const result = await archiveProduct(product.id, sanitizedReason || "");

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
      {isOpen && <EditProductForm setIsModalOpen={close} product={product} />}

      <div className="flex text-xl gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => setShowProductDetailsModal(true)}>
                <IoMdEye className="text-gray-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Product</p>
            </TooltipContent>
          </Tooltip>

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

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <button onClick={() => setShowArchiveModal(true)}>
                    <IoArchiveOutline />
                  </button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Archive Product</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TooltipProvider>
      </div>

      {showArchiveModal && (
        <ConfirmationModal
          hasReason={true}
          closeModal={() => setShowArchiveModal(false)}
          description="Are you sure you want to
          archive this product?"
          title={`Archive Product "${product.product_name}"`}
          onClick={handleArchive}
          defaultBtnColor
          hasConfirmButton
          isPending={isPending}
        />
      )}

      {showReplenishModal && (
        <ReplenishFormModal
          setShowReplenishModal={setShowReplenishModal}
          product={product}
        />
      )}

      {showProductDetailsModal && (
        <ProductDetailsModal
          open={open}
          product={product}
          setShowProductDetailsModal={setShowProductDetailsModal}
          setShowReplenishModal={setShowReplenishModal}
        />
      )}
    </>
  );
};

export default Action;
