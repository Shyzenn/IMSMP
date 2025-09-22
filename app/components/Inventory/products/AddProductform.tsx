"use client";

import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { addProductSchema, TAddProductSchema } from "@/lib/types";
import { addNewProduct } from "@/lib/action/add";
import AddButton from "../../Button";
import FormField from "../../FormField";
import CancelButton from "../../CancelButton";
import LoadingButton from "@/components/loading-button";
import { Input } from "@/components/ui/input";
import CategoryField from "../../CategoryField";
import { useProductForm } from "@/app/hooks/useProductForm";
import { useModal } from "@/app/hooks/useModal";
import { IoMdAdd } from "react-icons/io";
import { useQuery } from "@tanstack/react-query";
import { ProductCategory } from "@prisma/client";

const AddProductForm = () => {
  const { isOpen, open, close } = useModal();
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");

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
    handleSubmitWrapper(() =>
      addNewProduct({ ...data, category: data.category.trim().toLowerCase() })
    );

  const { data: categories, refetch } = useQuery<ProductCategory[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/product/category");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const res = await fetch("/api/product/category", {
        method: "POST",
        body: JSON.stringify({ name: newCategory }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to add category");

      toast.success("Category added successfully!");
      setCategoryModalOpen(false);
      setNewCategory("");
      await refetch();
    } catch (err) {
      console.error("Error adding category", err);
      toast.error("Failed to add category");
    }
  };

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

                <div className="flex items-end">
                  <CategoryField
                    categoryLabel="Select a category"
                    items={categories || []}
                    label="Category"
                    control={control}
                    name="category"
                    error={errors.category?.message}
                  />
                  <button
                    className="border ml-2 py-[5px] px-4 rounded-md bg-green-600 text-white hover:bg-green-500"
                    type="button"
                    onClick={() => setCategoryModalOpen(true)}
                  >
                    Add
                  </button>
                </div>

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

      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Add Category</h2>
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter new category"
            />
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddProductForm;
