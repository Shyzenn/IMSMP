"use client";

import React, { useState } from "react";
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

const Action = ({ product }: { product: ProductProps }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {isModalOpen && (
        <EditProductForm setIsModalOpen={setIsModalOpen} product={product} />
      )}

      <div className="flex text-xl gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => setIsModalOpen(true)}>
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
                {/* <Link href={`/admin/products/editProduct/${product.id}`}> */}
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
