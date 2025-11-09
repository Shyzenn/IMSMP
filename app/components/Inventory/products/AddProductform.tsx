"use client";

import React, { useCallback, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { addProductSchema, TAddProductSchema } from "@/lib/types";
import { addNewProduct } from "@/lib/action/add";
import AddButton from "../../Button";
import FormField from "../../FormField";
import CancelButton from "../../CancelButton";
import LoadingButton from "@/components/loading-button";
import { Input } from "@/components/ui/input";
import { useProductForm } from "@/app/hooks/useProductForm";
import { useModal } from "@/app/hooks/useModal";
import { IoMdAdd } from "react-icons/io";
import { useQuery } from "@tanstack/react-query";
import { ProductCategory } from "@prisma/client";
import CategoryDropdown from "../../CategoryDropdown";

export type ModalMode = "add" | "edit" | "delete" | null;

const AddProductForm = () => {
  const { isOpen, open, close } = useModal();
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] =
    useState<ProductCategory | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
    reset,
    setError,
  } = useForm<TAddProductSchema>({
    resolver: zodResolver(addProductSchema),
  });

  const notify = useCallback(() => {
    toast.success("Product created successfully! 🎉", { icon: "✅" });
  }, []);

  const { handleSubmitWrapper } = useProductForm(setError, () => {
    reset();
    notify();
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

  // ---- Category Modal Handler ----
  const openCategoryModal = (mode: ModalMode, category?: ProductCategory) => {
    setModalMode(mode);
    setSelectedCategoryForEdit(category ?? null);
    setCategoryName(category?.name ?? "");
  };

  return (
    <>
      <AddButton
        label="Add Product"
        className="px-4 py-2 flex items-center gap-2"
        onClick={open}
        icon={<IoMdAdd className="text-xl " />}
      />

      {/* Product Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white w-full max-w-[500px] max-h-[95vh] rounded-md relative py-4">
            <p className="text-xl text-center font-medium">Add Product</p>

            <form
              className="pb-[70px] mt-12 overflow-y-auto max-h-[calc(95vh-150px)]"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="flex flex-col gap-8 mb-4 px-12">
                {/* Product Name */}
                <FormField
                  label="Product Name"
                  error={errors.product_name?.message}
                >
                  <Input
                    {...register("product_name")}
                    placeholder="Enter product name"
                  />
                </FormField>

                {/* Category Field */}
                <FormField label="Category" error={errors.category?.message}>
                  <Controller
                    control={control}
                    name="category"
                    render={({ field }) => (
                      <CategoryDropdown
                        setCategoryName={setCategoryName}
                        setSelectedCategoryForEdit={setSelectedCategoryForEdit}
                        setModalMode={setModalMode}
                        refetch={refetch}
                        modalMode={modalMode}
                        selectedCategoryForEdit={selectedCategoryForEdit}
                        categoryName={categoryName}
                        field={field}
                        categories={categories}
                        openCategoryModal={openCategoryModal}
                      />
                    )}
                  />
                </FormField>

                {/* Price Field */}
                <FormField label="Price" error={errors.price?.message}>
                  <Input
                    {...register("price")}
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Enter price"
                    onWheel={(e) => e.currentTarget.blur()}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown")
                        e.preventDefault();
                    }}
                  />
                </FormField>
              </div>

              {/* Footer */}
              <div className="flex gap-6 bg-white border-t-2 p-4 absolute bottom-0 left-0 w-full justify-end">
                <CancelButton onClick={close} reset={reset} />
                <button
                  disabled={!isDirty || isSubmitting}
                  className={`px-12 rounded-md ${
                    !isDirty || isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-buttonBgColor hover:bg-buttonHover text-white"
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
