"use client";

import { signUpSchema, TSignUpSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useState } from "react";
import AddUserForm from "./AddUserForm";
import AddButton from "./Button";
import { FiPlus } from "react-icons/fi";
import { registerUser } from "@/lib/action/add";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const AddUser = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    control,
    reset,
  } = useForm<TSignUpSchema>({
    resolver: zodResolver(signUpSchema),
  });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (responseData) => {
      if (responseData.errors) {
        Object.keys(responseData.errors).forEach((field) => {
          setError(field as keyof TSignUpSchema, {
            type: "server",
            message: responseData.errors[field],
          });
        });
      } else if (responseData.success) {
        setIsOpen(false);
        reset();
        toast.success("User added successfully! 🎉", {
          icon: "✅",
        });

        queryClient.invalidateQueries({ queryKey: ["users"] });
      }
    },
    onError: (error) => {
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.errors) {
          Object.keys(errorData.errors).forEach((field) => {
            setError(field as keyof TSignUpSchema, {
              type: "server",
              message: errorData.errors[field],
            });
          });
        } else {
          toast.error("An unexpected error occurred.");
        }
      } catch {
        toast.error("An unexpected error occurred.");
      }
    },
  });

  const onSubmit = (data: TSignUpSchema) => {
    mutation.mutate(data);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40" />
      )}
      {isOpen && (
        <div className="flex justify-center items-center overflow-y-auto py-5 z-40 h-auto w-[28rem] absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <AddUserForm
            onSubmit={onSubmit}
            register={register}
            handleSubmit={handleSubmit}
            errors={errors}
            isSubmitting={mutation.isPending}
            control={control}
            setIsOpen={setIsOpen}
          />
        </div>
      )}
      <AddButton
        onClick={() => setIsOpen(true)}
        label="Add User"
        icon={<FiPlus className="text-lg" />}
        className="px-8 flex items-center py-2 gap-2"
      />
    </>
  );
};

export default AddUser;
