import React, { useCallback } from "react";
import FormField from "../../ui/FormField";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { editBatchSchema, TEditBatchSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import LoadingButton from "@/components/loading-button";
import CancelButton from "../../ui/CancelButton";
import toast from "react-hot-toast";
import { BatchProps } from "./BatchTable";
import DateField from "../../ui/DateField";
import { formatPackageType } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { IoClose } from "react-icons/io5";
import { useFormHook } from "@/app/hooks/useFormHook";
import { productService } from "@/services/product.service";

const EditBatchForm = ({
  setIsModalOpen,
  batches,
}: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  batches: BatchProps;
}) => {
  const {
    register,
    setError,
    formState: { errors, isSubmitting, isDirty },
    handleSubmit,
    control,
    watch,
  } = useForm<TEditBatchSchema>({
    resolver: zodResolver(editBatchSchema),
    defaultValues: {
      id: batches.id,
      quantity: batches.quantity,
      manufactureDate: batches.manufactureDate,
      expiryDate: batches.expiryDate,
      notes: batches.notes,
    },
  });

  const notify = useCallback(() => {
    toast.success("Product Batch edited successfully! 🎉", { icon: "✅" });
  }, []);

  const { handleSubmitWrapper } = useFormHook(setError, () => {
    notify();
    setIsModalOpen(false);
  });

  const onSubmit = (data: TEditBatchSchema) => {
    return handleSubmitWrapper(() => productService.editBatch(data));
  };

  const quantity = watch("quantity");
  const newTotalStock = Number(quantity) + Number(batches.totalQuantity);

  const CardsWrapper = ({
    label,
    value,
    background,
    labelColor,
    valueColor,
  }: {
    label: string;
    value: string | number;
    background: string;
    labelColor: string;
    valueColor: string;
  }) => {
    return (
      <div
        className={`rounded-md shadow-sm w-full h-[5rem] p-3 flex flex-col gap-1 ${background}`}
      >
        <p className={`text-slate-500 font-semibold text-xs ${labelColor}`}>
          {label}
        </p>
        <p className={`text-sm mt-2 font-bold ${valueColor}`}>{value}</p>
      </div>
    );
  };

  const cards = [
    {
      key: 1,
      label: `Current Stock`,
      value: batches.totalQuantity,
    },
    {
      key: 2,
      label: `Incoming Stock`,
      value: quantity,
    },
    {
      key: 3,
      label: `New Total Stock`,
      value: newTotalStock,
    },
  ];

  const ProductInformation = ({
    label,
    value,
    classname,
  }: {
    label: string;
    value: string | { id: number; name: string } | null;
    classname: string;
  }) => {
    const displayValue =
      typeof value === "string" ? value : value ? value.name : "-";

    return (
      <div className={`py-2 w-full ${classname}`}>
        <p className="text-slate-500 text-xs flex flex-col">
          {label}
          <span className="text-sm text-black font-semibold">
            {displayValue}
          </span>
        </p>
      </div>
    );
  };

  const productName = `${batches.product.product_name} ${
    batches.product.strength
  } ${
    batches.product.dosageForm
      ? formatPackageType(batches.product.dosageForm)
      : ""
  }`;

  const productDetailsLeft = [
    { key: 1, label: "Product Name", value: productName },
    { key: 2, label: "Category", value: batches.product.category },
  ];

  const productDetailsRight = [
    {
      key: 1,
      label: "Generic Name",
      value: batches.product.genericName ? batches.product.genericName : "N/A",
    },
    {
      key: 2,
      label: "Price",
      value: `₱${batches.product.price}`,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-gray-100 w-full max-w-[700px] max-h-[95vh] rounded-md relative overflow-auto px-8 py-6">
        <div className="flex flex-col gap-4 w-full">
          <div>
            {" "}
            <p className="text-xl font-semibold w-full pb-2 flex flex-col">
              Replenish Product{" "}
              <span className="text-xs text-slate-500">
                Product ID: #PRD-0{batches.product.productId}
              </span>
            </p>
            <button
              className="absolute right-4 top-4 cursor-pointer"
              onClick={() => setIsModalOpen(false)}
            >
              <IoClose className=" text-lg text-gray-600 " />
            </button>
          </div>

          {/* Replenish Cards */}
          <div className="flex gap-4 w-full ">
            {cards.map((card) => (
              <CardsWrapper
                {...card}
                key={card.key}
                background={`${card.key === 3 ? "bg-green-100" : "bg-white"}`}
                labelColor={`${card.key === 3 ? "text-green-900" : ""}`}
                valueColor={`${card.key === 2 ? "text-green-600" : ""} ${
                  card.key === 3 ? "text-green-600" : ""
                }`}
              />
            ))}
          </div>

          {/* Product Information */}
          <div className="bg-white rounded-md px-8 w-full py-4">
            <div className="border-b pb-4 mb-2">
              <p className="font-semibold text-lg border-slate-200 pb-2">
                Product Information
              </p>
              <div className="flex w-full gap-6">
                <div className="w-full">
                  {productDetailsLeft.map((productDetail) => (
                    <ProductInformation
                      label={productDetail.label}
                      value={productDetail.value}
                      key={productDetail.key}
                      classname={`border-t`}
                    />
                  ))}
                </div>
                <div className="w-full">
                  {productDetailsRight.map((productDetail) => (
                    <ProductInformation
                      label={productDetail.label}
                      value={productDetail.value}
                      key={productDetail.key}
                      classname={`border-t`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Replenish Form/Details */}

            <form
              className="overflow-y-auto max-h-[calc(95vh-150px)] w-full"
              onSubmit={handleSubmit(onSubmit)}
            >
              <p className="font-semibold text-lg mb-4">
                Replenishment Details
              </p>
              <div className="flex flex-col gap-8 w-full mb-8 border-b pb-6 px-1">
                <div className="flex w-full gap-4">
                  <FormField label="Quantity" error={errors.quantity?.message}>
                    <Input
                      {...register("quantity")}
                      id="quantity"
                      type="number"
                      min={1}
                      className="mt-1"
                      placeholder={`e.g., 10 `}
                    />
                  </FormField>
                </div>
                <div className="flex w-full gap-4">
                  <DateField
                    control={control}
                    label="Manufactured Date"
                    name="manufactureDate"
                    error={errors.manufactureDate?.message}
                  />
                  <DateField
                    control={control}
                    label="Expiry Date"
                    name="expiryDate"
                    error={errors.expiryDate?.message}
                  />
                </div>
                <div>
                  <label
                    htmlFor="notes"
                    className="text-sm font-medium mb-[3px] text-gray-700"
                  >
                    Notes (Optional)
                  </label>
                  <Textarea
                    {...register("notes")}
                    id="notes"
                    placeholder="Any relevant notes about this batch"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <CancelButton setIsModalOpen={() => setIsModalOpen(false)} />
                <button
                  disabled={!isDirty || isSubmitting}
                  className={`px-12 rounded-md ${
                    !isDirty || isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : " cursor-pointer bg-buttonBgColor hover:bg-buttonHover text-white"
                  }`}
                  type="submit"
                >
                  {isSubmitting ? (
                    <LoadingButton color="text-white" />
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBatchForm;
