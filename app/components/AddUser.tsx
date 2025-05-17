"use client";

import { signUpSchema, TSignUpSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { registerUser } from "@/lib/action";
import { useState } from "react";
import AddUserForm from "./AddUserForm";
import AddButton from "./Button";
import { FiPlus } from "react-icons/fi";

const AddUser = () => {
  const [isOpen, setIsOpen] = useState(false);

  const notify = () =>
    toast.success("User added successfully! 🎉", {
      icon: "✅",
    });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    control,
    reset,
  } = useForm<TSignUpSchema>({
    resolver: zodResolver(signUpSchema),
  });

  const handleErrors = (errors: Record<string, string>) => {
    Object.keys(errors).forEach((field) => {
      setError(field as keyof TSignUpSchema, {
        type: "server",
        message: errors[field],
      });
    });
  };

  const onSubmit = async (data: TSignUpSchema) => {
    try {
      const responseData = await registerUser(data);

      if (responseData.errors) {
        handleErrors(responseData.errors);
      } else if (responseData.success) {
        setIsOpen(false);
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
    console.log("Submitted data:", data);
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30" />}
      {isOpen && (
        <div className="flex justify-center items-center overflow-y-auto py-5 z-40 h-auto w-[28rem] absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <AddUserForm
            onSubmit={onSubmit}
            register={register}
            handleSubmit={handleSubmit}
            errors={errors}
            isSubmitting={isSubmitting}
            control={control}
            setIsOpen={setIsOpen}
          />
        </div>
      )}
      <AddButton
        onClick={() => setIsOpen(true)}
        label="Add User"
        icon={<FiPlus />}
        className=""
      />
    </>
  );
};

export default AddUser;
