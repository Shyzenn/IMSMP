"use client";

import React, { useCallback, useState } from "react";
import CategoryField from "./CategoryField";
import CancelButton from "./CancelButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editUserSchema, TEditUserSchema } from "@/lib/types";
import { UserFormValues } from "@/lib/interfaces";
import LoadingButton from "@/components/loading-button";
import toast from "react-hot-toast";
import { useProductForm } from "../hooks/useProductForm";
import { editUser } from "@/lib/action/add";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import ResetPasswordModal from "./ResetPasswordModal";
import FormField from "./FormField";
import { Input } from "@/components/ui/input";

const UserEditModal = ({
  setIsModalOpen,
  user,
}: {
  user: UserFormValues;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [showResetModal, setShowResetModal] = useState(false);

  const {
    setError,
    formState: { errors, isSubmitting, isDirty },
    handleSubmit,
    control,
    register,
  } = useForm<TEditUserSchema>({
    resolver: zodResolver(editUserSchema()),
    defaultValues: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      role: user.role,
    },
  });

  const notify = useCallback(() => {
    toast.success("User edited successfully! 🎉", { icon: "✅" });
  }, []);

  const queryClient = useQueryClient();

  const { handleSubmitWrapper } = useProductForm(setError, async () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
    notify();
    setIsModalOpen(false);
  });

  const onSubmit = async (data: TEditUserSchema) => {
    const payload = {
      ...data,
    };

    try {
      await axios.patch("/api/user/update", payload);
      handleSubmitWrapper(() => editUser(data));
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.errors) {
          Object.entries(error.response.data.errors).forEach(
            ([field, message]) => {
              setError(field as keyof TEditUserSchema, {
                type: "server",
                message: message as string,
              });
            }
          );
        } else {
          toast.error("Failed to update user. Please try again.");
        }
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white w-full max-w-[500px] max-h-[95vh] rounded-md relative py-4">
        <p className="text-xl text-center font-medium">Edit User</p>
        <form
          className="pb-[70px] mt-12 overflow-y-auto max-h-[calc(95vh-150px)]"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-6 mb-4 px-12">
            <FormField label="First Name" error={errors.firstName?.message}>
              <Input
                {...register("firstName")}
                id="firstName"
                placeholder="enter first name"
                type="text"
              />
            </FormField>

            <FormField label="Middle Name" error={errors.middleName?.message}>
              <Input
                {...register("middleName")}
                id="middleName"
                placeholder="enter middle name (Optional)"
                type="text"
              />
            </FormField>

            <FormField label="Last Name" error={errors.lastName?.message}>
              <Input
                {...register("lastName")}
                id="lastName"
                placeholder="enter last name"
                type="text"
              />
            </FormField>

            <FormField label="Username" error={errors.username?.message}>
              <Input
                {...register("username")}
                id="username"
                placeholder="username"
                type="text"
              />
            </FormField>

            <FormField label="Email" error={errors.email?.message}>
              <Input
                {...register("email")}
                id="email"
                placeholder="example@email.com"
                type="email"
              />
            </FormField>
            <CategoryField
              label="User Type"
              control={control}
              name="role"
              error={errors.role?.message}
              categoryLabel={user.role.replace("_", " ")}
              items={["Nurse", "Pharmacist Staff", "Manager", "Cashier"].map(
                (role, index) => ({ id: index + 1, name: role })
              )}
            />
          </div>

          <div className="mx-12">
            <button
              className={"text-blue-500 hover:underline mb-2"}
              type="button"
              onClick={() => setShowResetModal(true)}
            >
              reset password?
            </button>
          </div>

          <ResetPasswordModal
            user={user}
            setShowResetModal={setShowResetModal}
            showResetModal={showResetModal}
          />

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

export default UserEditModal;
