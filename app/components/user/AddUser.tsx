"use client";

import { signUpSchema, TSignUpSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import AddUserForm from "./AddUserForm";
import AddButton from "../ui/Button";
import { userService } from "@/services/user.service";
import { ApiError } from "@/services/api/errors";

const AddUser = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: session } = useSession();

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
    mutationFn: userService.addUser,

    onSuccess: () => {
      setIsOpen(false);
      reset();

      toast.success(
        "User created successfully. An OTP has been sent to their email for verification. 🎉",
        { duration: 10000 }
      );

      queryClient.invalidateQueries({ queryKey: ["users"] });
    },

    onError: (error: ApiError<TSignUpSchema>) => {
      if (error.errors) {
        Object.entries(error.errors).forEach(([field, message]) => {
          setError(field as keyof TSignUpSchema, {
            type: "server",
            message,
          });
        });
        return;
      }

      toast.error(error.message || "An unexpected error occurred.");
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
            reset={reset}
          />
        </div>
      )}
      <AddButton
        onClick={() => setIsOpen(true)}
        label={session?.user.role === "SuperAdmin" ? "Add Manager" : "Add User"}
        icon={<FiPlus className="text-lg" />}
        className="w-[10rem] md:w-auto md:px-8 justify-center flex items-center py-2 gap-2 "
      />
    </>
  );
};

export default AddUser;
