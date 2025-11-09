import React, { useCallback } from "react";
import FormField from "../../FormField";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { editBatchSchema, TEditBatchSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { editBatch } from "@/lib/action/add";
import LoadingButton from "@/components/loading-button";
import CancelButton from "../../CancelButton";
import { useProductForm } from "@/app/hooks/useProductForm";
import toast from "react-hot-toast";
import { BatchProps } from "./BatchTable";
import DateField from "../../DateField";

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
  } = useForm<TEditBatchSchema>({
    resolver: zodResolver(editBatchSchema),
    defaultValues: {
      id: batches.id,
      quantity: batches.quantity,
      releaseDate: batches.releaseDate,
      expiryDate: batches.expiryDate,
    },
  });

  const notify = useCallback(() => {
    toast.success("Product Batch edited successfully! 🎉", { icon: "✅" });
  }, []);

  const { handleSubmitWrapper } = useProductForm(setError, () => {
    notify();
    setIsModalOpen(false);
  });

  const onSubmit = (data: TEditBatchSchema) => {
    return handleSubmitWrapper(() => editBatch(data));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white w-full max-w-[500px] max-h-[95vh] rounded-md relative py-4">
        <p className="text-xl text-center font-medium">Edit Batch</p>
        <form
          className="pb-[70px] mt-12 overflow-y-auto max-h-[calc(95vh-150px)]"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-8 mb-4 px-12">
            <FormField label="Quantity" error={errors.quantity?.message}>
              <Input
                {...register("quantity")}
                id="quantity"
                type="number"
                className="mt-1"
              />
            </FormField>

            <DateField
              control={control}
              label="Manufactured Date"
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

export default EditBatchForm;
