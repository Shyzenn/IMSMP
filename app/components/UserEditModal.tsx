"use client";

import { Input } from "@/components/ui/input";
import React, { useCallback, useState } from "react";
import FormField from "./FormField";
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
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import axios from "axios";

const UserEditModal = ({
  setIsModalOpen,
  user,
}: {
  user: UserFormValues;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [isResetPassword, setIsResestPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    setError,
    formState: { errors, isSubmitting, isDirty },
    handleSubmit,
    control,
    setValue,
  } = useForm<TEditUserSchema>({
    resolver: zodResolver(editUserSchema(isResetPassword)),
    defaultValues: {
      id: user.id,
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
      isResetPassword,
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

  const resetPasswordBtn = () => {
    setIsResestPassword((prev) => {
      const newValue = !prev;
      if (!newValue) {
        setValue("password", "");
        setValue("confirmPassword", "");
      }
      return newValue;
    });
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
            <FormField label="Username" error={errors.username?.message}>
              <Input
                {...register("username")}
                id="username"
                type="text"
                className="mt-1"
              />
            </FormField>

            <CategoryField
              label="User Type"
              control={control}
              name="role"
              error={errors.role?.message}
              categoryLabel={user.role.replace("_", " ")}
              items={["Nurse", "Pharmacist Staff", "Manager", "Cashier"]}
            />
          </div>

          <div className="mx-12">
            <button
              className={`${
                isResetPassword ? "text-red-500" : "text-blue-500"
              } hover:underline mb-2`}
              onClick={resetPasswordBtn}
              type="button"
            >
              {isResetPassword ? "cancel" : "reset password?"}
            </button>

            {isResetPassword && (
              <>
                <FormField
                  label="New Password"
                  error={errors.password?.message}
                >
                  <div className="relative">
                    <Input
                      {...register("password")}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="mt-1 mb-6 relative"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowPassword((prev) => !prev);
                      }}
                      className="absolute right-3 top-3"
                    >
                      {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                    </button>
                  </div>
                </FormField>
                <FormField
                  label="Confirm Password"
                  error={errors.confirmPassword?.message}
                >
                  <div className="relative">
                    <Input
                      {...register("confirmPassword")}
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      className="mt-1"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowConfirmPassword((prev) => !prev);
                      }}
                      className="absolute right-3 top-3"
                    >
                      {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                    </button>
                  </div>
                </FormField>
              </>
            )}
          </div>

          <div className="flex gap-6 bg-white border-t-2 p-4 absolute bottom-0 left-0 w-full justify-end">
            <CancelButton setIsModalOpen={setIsModalOpen} />
            <button
              disabled={!isDirty || isSubmitting}
              className={`px-12 rounded-md ${
                !isDirty || isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : " cursor-pointer bg-green-500 hover:bg-green-600 text-white"
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
