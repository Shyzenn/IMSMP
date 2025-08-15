"use client";

import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { addProductSchema, TAddProductSchema } from "@/lib/types";
import { addNewProduct } from "@/lib/action/add";
import AddButton from "../Button";
import FormField from "../FormField";
import CancelButton from "../CancelButton";
import LoadingButton from "@/components/loading-button";
import { Input } from "@/components/ui/input";
import CategoryField from "../CategoryField";
import DateField from "../DateField";
import { useProductForm } from "@/app/hooks/useProductForm";
import { useModal } from "@/app/hooks/useModal";
import { IoMdAdd } from "react-icons/io";

const AddProductForm = () => {
  const { isOpen, open, close } = useModal();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
    setError,
    control,
  } = useForm<TAddProductSchema>({
    resolver: zodResolver(addProductSchema),
  });

  const notify = useCallback(() => {
    toast.success("Product created successfully! 🎉", { icon: "✅" });
  }, []);

  const { handleSubmitWrapper } = useProductForm(setError, () => {
    reset();
    notify();
    close();
  });

  const onSubmit = async (data: TAddProductSchema) =>
    handleSubmitWrapper(() => addNewProduct(data));

  return (
    <>
      <AddButton
        label="Add New Product"
        className="px-4 py-2 flex items-center gap-2"
        onClick={open}
        icon={<IoMdAdd className="text-xl " />}
      />

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white w-full max-w-[500px] max-h-[95vh] rounded-md relative py-4">
            <p className="text-xl text-center font-medium">Add Product</p>
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
                    placeholder="Enter product name"
                  />
                </FormField>
                <CategoryField
                  categoryLabel="Select a category"
                  items={["PAIN_RELIEVER", "ANTIBIOTIC"]}
                  label="Category"
                  control={control}
                  name="category"
                  error={errors.category?.message}
                />
                <div className="flex w-full gap-2">
                  <FormField label="Quantity" error={errors.quantity?.message}>
                    <Input
                      {...register("quantity")}
                      type="number"
                      placeholder="Enter quantity"
                    />
                  </FormField>
                  <FormField label="Price" error={errors.price?.message}>
                    <Input
                      {...register("price")}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter price"
                    />
                  </FormField>
                </div>
                <div className="flex justify-between w-full">
                  <DateField
                    control={control}
                    label="Release Date"
                    name="releaseDate"
                    error={errors.releaseDate?.message}
                    className="w-[12.4rem]"
                  />
                  <DateField
                    control={control}
                    label="Expiry Date"
                    name="expiryDate"
                    error={errors.expiryDate?.message}
                    className="w-[12.4rem]"
                  />
                </div>
              </div>

              <div className="flex gap-6 bg-white border-t-2 p-4 absolute bottom-0 left-0 w-full justify-end">
                <CancelButton onClick={close} />
                <button
                  disabled={!isDirty || isSubmitting}
                  className={`px-12 rounded-md ${
                    !isDirty || isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                  type="submit"
                >
                  {isSubmitting ? (
                    <LoadingButton color="text-white" />
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddProductForm;
