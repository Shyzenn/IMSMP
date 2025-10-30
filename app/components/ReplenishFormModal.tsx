import React, { useCallback } from "react";
import FormField from "./FormField";
import { Input } from "@/components/ui/input";
import DateField from "./DateField";
import CancelButton from "./CancelButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { replenishProductSchema, TReplenishProductSchema } from "@/lib/types";
import toast from "react-hot-toast";
import LoadingButton from "@/components/loading-button";
import { useProductForm } from "../hooks/useProductForm";
import { replenishProduct } from "@/lib/action/add";

const ReplenishFormModal = ({
  setShowReplenishModal,
  productId,
}: {
  setShowReplenishModal: React.Dispatch<React.SetStateAction<boolean>>;
  productId: number;
}) => {
  const {
    setError,
    register,
    reset,
    control,
    formState: { errors, isSubmitting, isDirty },
    handleSubmit,
  } = useForm<TReplenishProductSchema>({
    resolver: zodResolver(replenishProductSchema),
    defaultValues: {
      productId,
    },
  });

  const notify = useCallback(() => {
    toast.success("Product replenish successfully! 🎉", { icon: "✅" });
  }, []);

  const { handleSubmitWrapper } = useProductForm(setError, () => {
    reset();
    notify();
    setShowReplenishModal(false);
  });

  const onSubmit = (data: TReplenishProductSchema) => {
    return handleSubmitWrapper(() => replenishProduct(data));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div
        className="print:block bg-white w-full max-w-[500px] max-h-[95vh] rounded-md relative overflow-auto p-4"
        id="print-section"
      >
        <div className="flex items-center justify-center flex-col gap-4 w-full">
          <p className="text-xl font-semibold border-b w-full text-center pb-2">
            Replenish Product
          </p>

          <form
            className="pb-[70px] mt-12 overflow-y-auto max-h-[calc(95vh-150px)] w-full"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-8 px-12 w-full mb-8">
              <FormField label="Quantity" error={errors.quantity?.message}>
                <Input
                  {...register("quantity")}
                  id="quantity"
                  type="number"
                  className="mt-1"
                  placeholder="Enter quantity"
                />
              </FormField>

              <DateField
                control={control}
                label="Release Date"
                name="releaseDate"
                error={errors.releaseDate?.message}
              />
              <DateField
                control={control}
                label="Expiry Date"
                name="expiryDate"
                error={errors.expiryDate?.message}
              />
            </div>

            <div className="flex gap-6 bg-white border-t-2 p-4 absolute bottom-0 left-0 w-full justify-end">
              <CancelButton
                setIsModalOpen={() => setShowReplenishModal(false)}
                reset={reset}
              />
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
    </div>
  );
};

export default ReplenishFormModal;
