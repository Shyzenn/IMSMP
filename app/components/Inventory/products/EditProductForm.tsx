"use client";

import React, { useCallback } from "react";
import FormField from "../../FormField";
import { Input } from "@/components/ui/input";
import { ProductProps } from "./InventoryTable";
import { useForm } from "react-hook-form";
import { editProductSchema, TEditProductSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { editNewProduct } from "@/lib/action/add";
import LoadingButton from "@/components/loading-button";
import CancelButton from "../../CancelButton";
import { useProductForm } from "@/app/hooks/useProductForm";
import toast from "react-hot-toast";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import CategoryField from "../../CategoryField";

const EditProductForm = ({
  setIsModalOpen,
  product,
}: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  product: ProductProps;
}) => {
  const {
    register,
    setError,
    formState: { errors, isSubmitting, isDirty },
    handleSubmit,
    control,
  } = useForm<TEditProductSchema>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      productId: product.id,
      product_name: product.product_name,
      price: product.price,
      category: product.category,
    },
  });

  const notify = useCallback(() => {
    toast.success("Product edited successfully! 🎉", { icon: "✅" });
  }, []);

  const { handleSubmitWrapper } = useProductForm(setError, () => {
    notify();
    setIsModalOpen(false);
  });

  const onSubmit = async (data: TEditProductSchema) => {
    handleSubmitWrapper(() => editNewProduct(data));
  };

  const getCategories = async () => {
    try {
      const response = await axios.get("/api/product/category");
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
        throw new Error(
          error.response?.data?.message || "Failed to fetch categories"
        );
      } else {
        console.error("Unexpected error:", error);
        throw new Error(
          "An unexpected error occurred while fetching categories"
        );
      }
    }
  };

  const { data: categoriesData = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white w-full max-w-[500px] max-h-[95vh] rounded-md relative py-4">
        <p className="text-xl text-center font-medium">Edit Product</p>
        <form
          className="pb-[70px] mt-12 overflow-y-auto max-h-[calc(95vh-150px)]"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-8 mb-4 px-12">
            <FormField
              label="Product Name"
              error={errors.product_name?.message}
            >
              <Input
                {...register("product_name")}
                id="product_name"
                type="text"
                className="mt-1"
              />
            </FormField>
            <CategoryField
              label="Category"
              control={control}
              name="category"
              error={errors.category?.message}
              categoryLabel={"Select a category"}
              items={categoriesData}
            />

            <FormField label="Price" error={errors.price?.message}>
              <Input
                {...register("price")}
                type="number"
                min="0"
                step="any"
                placeholder="Enter price"
                onWheel={(e) => e.currentTarget.blur()}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    e.preventDefault();
                  }
                }}
              />
            </FormField>
          </div>

          <div className="flex gap-6 bg-white border-t-2 p-4 absolute bottom-0 left-0 w-full justify-end">
            <CancelButton setIsModalOpen={setIsModalOpen} />
            <button
              disabled={!isDirty || isSubmitting}
              className={`px-12 rounded-md ${
                !isDirty || isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : " cursor-pointer bg-buttonBgColor hover:bg-buttonHover text-white"
              }`}
              type="submit"
            >
              {isSubmitting ? <LoadingButton color="text-white" /> : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductForm;
