"use client";

import React, { useCallback, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { editProductSchema, TEditProductSchema } from "@/lib/types";
import FormField from "../../ui/FormField";
import LoadingButton from "@/components/loading-button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";

import { IoClose } from "react-icons/io5";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import SearchableSelect from "../../ui/SearchableSelect";
import CategoryField from "../../ui/CategoryField";
import axios from "axios";
import { ProductProps } from "./InventoryTable";
import CancelButton from "../../ui/CancelButton";
import { useFormHook } from "@/app/hooks/useFormHook";
import { productService } from "@/services/product.service";

const EditProductForm = ({
  setIsModalOpen,
  product,
}: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  product: ProductProps;
}) => {
  const [isCheckingProduct, setIsCheckingProduct] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<TEditProductSchema>({
    resolver: zodResolver(editProductSchema),
    mode: "onChange",
    defaultValues: {
      productId: product.id,
      product_name: product.product_name,
      category: product.category,
      strength: product.strength ?? "",
      dosageForm: product.dosageForm ?? "",
      description: product.description ?? "",
      genericName: product.genericName ?? "",
      manufacturer: product.manufacturer ?? "",
      minimumStockAlert: product.minimumStockAlert,
      price: product.price,
    },
  });

  const notify = useCallback(() => {
    toast.success("Product edited successfully! 🎉", { icon: "✅" });
  }, []);

  const { handleSubmitWrapper } = useFormHook(setError, () => {
    notify();
    setIsModalOpen(false);
  });

  const onSubmit = async (data: TEditProductSchema) => {
    await handleSubmitWrapper(() => productService.editProduct(data));
  };

  const checkProductExist = async (productName: string, strength?: string) => {
    if (!productName.trim()) return;

    setIsCheckingProduct(true);

    try {
      const params = new URLSearchParams({
        name: productName.trim(),
      });

      if (strength?.trim()) {
        params.append("strength", strength.trim());
      }

      params.append("excludeProductId", product.id.toString());

      const response = await fetch(
        `/api/product/check_product_name?${params.toString()}`
      );
      const data = await response.json();

      if (data.exists) {
        setError("product_name", {
          type: "manual",
          message: strength
            ? `"${productName}" with strength "${strength}" already exists`
            : `Product "${productName}" already exists`,
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking product:", error);
      return true;
    } finally {
      setIsCheckingProduct(false);
    }
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
    <>
      {/* Product Modal */}

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
        <div className="bg-gray-50 w-full max-w-[600px] max-h-[95vh] rounded-md relative py-4 px-8">
          <div className="mb-6 relative">
            <p className="text-xl font-medium">Edit Product</p>
            <p className="text-sm text-gray-500">{`Product ID: #PRD-0${product.id}`}</p>
            <button
              className="absolute -right-2 -top-2 cursor-pointer"
              onClick={() => setIsModalOpen(false)}
            >
              <IoClose className=" text-lg text-gray-600 " />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="border py-6 px-4 rounded-lg">
              {/* General */}
              <div className="grid grid-cols-2 gap-8">
                <FormField
                  label="Product Name"
                  error={errors.product_name?.message}
                >
                  <div className="relative">
                    <Input
                      {...register("product_name")}
                      placeholder="e.g., Bioflu"
                    />
                    {isCheckingProduct && <></>}
                  </div>
                </FormField>

                <FormField
                  label="Generic Name (Optional)"
                  error={errors.genericName?.message}
                >
                  <Input
                    {...register("genericName")}
                    placeholder="e.g., Paracetamol"
                  />
                </FormField>

                <FormField
                  label="Strength (Optional)"
                  error={errors.strength?.message}
                >
                  <Input
                    {...register("strength")}
                    placeholder="e.g., 500mg"
                    onBlur={async (e) => {
                      const productName = watch("product_name");
                      if (productName) {
                        await checkProductExist(productName, e.target.value);
                      }
                    }}
                  />
                </FormField>
                <FormField
                  label="Dosage Form (Optional)"
                  error={errors.dosageForm?.message}
                >
                  <Controller
                    control={control}
                    name="dosageForm"
                    render={({ field }) => (
                      <SearchableSelect
                        field={field}
                        label="Select Dosage Form"
                        option={[
                          { label: "Tablet", value: "tablet" },
                          { label: "Capsule", value: "capsule" },
                          { label: "Caplet", value: "caplet" },
                          { label: "Softgel", value: "softgel" },
                          { label: "Powder", value: "powder" },
                          { label: "Solution", value: "solution" },
                          { label: "Suspension", value: "suspension" },
                          { label: "Syrup", value: "syrup" },
                          { label: "Injection", value: "injection" },
                          { label: "IV Solution", value: "iv_solution" },
                          { label: "Cream", value: "cream" },
                          { label: "Ointment", value: "ointment" },
                          { label: "Gel", value: "gel" },
                          { label: "Patch", value: "patch" },
                          { label: "Inhaler", value: "inhaler" },
                          { label: "Drops", value: "drops" },
                          { label: "Other", value: "other" },
                        ]}
                      />
                    )}
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

                <FormField
                  label="Manufacturer (Optional)"
                  error={errors.manufacturer?.message}
                >
                  <Input
                    {...register("manufacturer")}
                    placeholder="e.g., UNILAB"
                  />
                </FormField>

                <FormField
                  label="Low Stock Alert"
                  error={errors.minimumStockAlert?.message}
                >
                  <Input
                    {...register("minimumStockAlert")}
                    placeholder="e.g., 50 pcs"
                    type="number"
                  />
                </FormField>

                <FormField label="Price" error={errors.price?.message}>
                  <Input
                    {...register("price")}
                    type="number"
                    min="0"
                    step="any"
                    className="w-full"
                    placeholder="0.00"
                  />
                </FormField>

                <div className="col-span-2 w-full flex flex-col gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-[3px]">
                      Description (Optional)
                    </label>
                    <Textarea
                      {...register("description")}
                      placeholder="Brief description of medicine and its uses..."
                    />
                  </div>

                  <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
                    <Controller
                      control={control}
                      name="requiresPrescription"
                      defaultValue={false}
                      render={({ field }) => (
                        <Checkbox
                          id="toggle-2"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                        />
                      )}
                    />
                    <div className="grid gap-1.5 font-normal">
                      <p className="text-sm leading-none font-medium">
                        Requires Prescription (Rx)
                      </p>
                    </div>
                  </Label>
                </div>
              </div>
            </div>

            {/* Footer */}

            <div className="flex gap-6 bg-white border-t mt-4 pt-6 w-full justify-end rounded-b-md">
              <CancelButton onClick={() => setIsModalOpen(false)} />
              <button
                disabled={isSubmitting}
                className={`px-12 py-2 rounded-md ${
                  isSubmitting
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
    </>
  );
};

export default EditProductForm;
