"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useRef } from "react";
import DefaultUserImage from "@/public/defaultUserImg.jpg";
import { CiCamera } from "react-icons/ci";
import FormField from "./FormField";
import { Input } from "@/components/ui/input";
import CancelButton from "./CancelButton";
import LoadingButton from "@/components/loading-button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editUserProfileSchema, TeditUserProfileSchema } from "@/lib/types";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { useSession } from "next-auth/react";

const EditProfileModal = ({ close }: { close: () => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
    handleSubmit,
  } = useForm<TeditUserProfileSchema>({
    resolver: zodResolver(editUserProfileSchema),
  });

  const profileImage = watch("profileImage");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get("/api/user/me");
        if (data) {
          reset({
            username: data.username,
            email: data.email,
            profileImage: data.profileImage || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };
    fetchUser();
  }, [reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_PRESET as string
      );

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME}/image/upload`,
        formData
      );

      const imageUrl = res.data.secure_url;
      setValue("profileImage", imageUrl, { shouldDirty: true });
    } catch (error) {
      console.error("Image upload failed", error);
      toast.error("Failed to upload image");
    }
  };

  const notify = useCallback(() => {
    toast.success("Profile edited successfully! 🎉", { icon: "✅" });
  }, []);

  const { update } = useSession();

  const onSubmit = async (formData: TeditUserProfileSchema) => {
    try {
      await axios.put("/api/user/me", formData);

      await update({
        ...formData,
      });

      notify();
      close();
    } catch (error) {
      console.error("Failed to update profile", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div
        className="print:block bg-white w-full max-w-[500px] max-h-[95vh] rounded-md relative overflow-auto p-4"
        id="print-section"
      >
        {/* PROFILE PICTURE */}
        <div className="flex items-center justify-center flex-col gap-4">
          <p className="text-xl font-semibold border-b w-full text-center pb-2">
            Edit Profile
          </p>
          <div className="w-32 h-32 p-2 rounded-full bg-white relative">
            <Image
              src={profileImage || DefaultUserImage}
              alt="User Profile"
              fill
              className="object-cover rounded-full"
            />
            <div
              className="absolute bottom-3 right-1 p-2 bg-gray-500 w-8 h-8 rounded-full cursor-pointer hover:bg-gray-400"
              onClick={() => fileInputRef.current?.click()}
            >
              <CiCamera className="text-white text-lg text-center" />
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              hidden
            />
          </div>
        </div>

        {/* FORM */}
        <form
          className="pb-[70px] mt-12 overflow-y-auto max-h-[calc(95vh-150px)]"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-8 px-12">
            <FormField label="Username" error={errors.username?.message}>
              <Input
                {...register("username")}
                id="username"
                type="text"
                className="mt-1"
              />
            </FormField>
            <FormField label="Email" error={errors.email?.message}>
              <Input
                {...register("email")}
                id="email"
                type="email"
                className="mt-1"
              />
            </FormField>
          </div>
          <Link
            className="px-12 text-sm mt-2 text-blue-400 cursor-pointer w-auto"
            href="/change-password"
            target="_blank"
            rel="noopener noreferrer"
          >
            Change password?
          </Link>

          <div className="flex gap-6 bg-white border-t-2 p-4 absolute bottom-0 left-0 w-full justify-end">
            <CancelButton setIsModalOpen={close} reset={reset} />
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

export default EditProfileModal;
