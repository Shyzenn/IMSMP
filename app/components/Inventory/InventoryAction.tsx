"use client";

import { CiEdit } from "react-icons/ci";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IoArchiveOutline } from "react-icons/io5";
import { ProductProps } from "./InventoryTable";
import EditProductForm from "./EditProductForm";
import { useModal } from "@/app/hooks/useModal";

const Action = ({ product }: { product: ProductProps }) => {
  const { open, close, isOpen } = useModal();

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
              <button>
                <IoArchiveOutline />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Archive Product</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
};

export default Action;
