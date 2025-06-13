"use client";

import SubmitButton from "@/app/components/Button";
import toast from "react-hot-toast";
import { Controller, useForm } from "react-hook-form";
import { addProductSchema, TAddProductSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { addNewProduct } from "@/lib/action";
import LoadingButton from "@/components/loading-button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormField from "./FormField";
import DateField from "./DateField";
import { useCallback } from "react";

const AddNewProduct = () => {
  //No need to re-declare notify() on every render.
  const notify = useCallback(() => {
    toast.success("Product created successfully! 🎉", {
      icon: "✅",
    });
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
    control,
  } = useForm<TAddProductSchema>({
    resolver: zodResolver(addProductSchema),
  });

  const handleErrors = (errors: Record<string, string>) => {
    Object.keys(errors).forEach((field) => {
      setError(field as keyof TAddProductSchema, {
        type: "server",
        message: errors[field],
      });
    });
  };

  const onSubmit = async (data: TAddProductSchema) => {
    try {
      const responseData = await addNewProduct(data);

      if (responseData.errors) {
        handleErrors(responseData.errors);
      } else if (responseData.success) {
        reset();
        notify();
      }
    } catch (error) {
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.errors) {
            handleErrors(errorData.errors);
          } else {
            alert("An unexpected error occurred.");
          }
        } catch {
          alert("An unexpected error occurred.");
        }
      } else {
        alert("An unexpected error occurred.");
      }
    }
    console.log("Form Data:", data);
  };

  return (
    <form
      className="flex justify-between flex-col h-full py-14"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid grid-cols-2 gap-12">
        {/* Product Name */}
        <FormField label="Product Name" error={errors.product_name?.message}>
          <Input
            {...register("product_name")}
            id="product_name"
            placeholder="Enter product name"
            type="text"
          />
        </FormField>

        {/* Category */}
        <div>
          <label className="text-sm font-medium">Category</label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={(val) => field.onChange(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectGroup>
                    <SelectLabel>Category</SelectLabel>
                    <SelectItem
                      value="ANTIBIOTIC"
                      className="hover:bg-gray-100"
                    >
                      Antibiotic
                    </SelectItem>
                    <SelectItem
                      value="PAIN_RELIEVER"
                      className="hover:bg-gray-100"
                    >
                      Painkiller
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className="mt-2 text-sm text-red-500">
              {errors.category.message}
            </p>
          )}
        </div>

        {/* Quantity */}
        <FormField label="Quantity" error={errors.quantity?.message}>
          <Input
            {...register("quantity")}
            id="quantity"
            min="0"
            placeholder="Enter quantity"
            type="number"
            className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance:textfield]"
          />
        </FormField>

        {/* Price */}
        <FormField label="Price" error={errors.price?.message}>
          <Input
            {...register("price")}
            step="0.01"
            id="price"
            min="0"
            placeholder="Enter price"
            type="number"
            className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance:textfield]"
          />
        </FormField>

        {/* Release Date */}
        <DateField
          label="Release Date"
          name="releaseDate"
          control={control}
          error={errors.releaseDate?.message}
        />

        {/* Expiry Date */}
        <DateField
          label="Expiry Date"
          name="expiryDate"
          control={control}
          error={errors.expiryDate?.message}
        />
      </div>

      <div className="flex justify-end">
        <SubmitButton
          label={isSubmitting ? <LoadingButton /> : "Submit"}
          icon=""
          className="px-16"
          type="submit"
        />
      </div>
    </form>
  );
};

export default AddNewProduct;
