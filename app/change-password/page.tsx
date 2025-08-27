"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import LoadingButton from "@/components/loading-button";
import Image from "next/image";
import MacoleenLogo from "@/public/macoleens_logo.png";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { changePasswordSchema, TChangePasswordSchema } from "@/lib/types";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

const ChangePassword = () => {
  const [manualError, setManualError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const { data: session } = useSession();
  const userRole = session?.user.role;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (values: TChangePasswordSchema) => {
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        setManualError(data.error || "Failed to update password");
        return;
      }

      reset();

      if (userRole === "Manager") {
        window.location.href = "/dashboard";
      } else if (userRole === "Nurse") {
        window.location.href = "/request-order";
      } else if (userRole === "Pharmacist_Staff") {
        window.location.href = "/pharmacist_dashboard";
      } else if (userRole === "Cashier") {
        window.location.href = "/cashier_dashboard";
      } else {
        alert("Password successfully updated!");
      }
      toast.success("Change password successfully! 🎉", {
        icon: "✅",
      });
    } catch (error) {
      console.log(error);
      setManualError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[400px] bg-white pb-5">
        <CardHeader>
          <div className="flex justify-center">
            <Image
              src={MacoleenLogo}
              width={150}
              height={150}
              alt="Macoleen's Logo"
            />
          </div>
          <CardTitle className="text-center text-2xl">
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid w-full items-center gap-4">
              {/* Current Password */}
              <div className="flex flex-col space-y-1.5 relative">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  {...register("currentPassword")}
                  id="currentPassword"
                  type={showPassword.current ? "text" : "password"}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => ({
                      ...prev,
                      current: !prev.current,
                    }))
                  }
                  className="absolute right-3 top-7"
                >
                  {showPassword.current ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
                {errors.currentPassword && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="flex flex-col space-y-1.5 relative">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  {...register("newPassword")}
                  id="newPassword"
                  type={showPassword.new ? "text" : "password"}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => ({ ...prev, new: !prev.new }))
                  }
                  className="absolute right-3 top-7"
                >
                  {showPassword.new ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
                {errors.newPassword && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col space-y-1.5 relative">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  {...register("confirmPassword")}
                  id="confirmPassword"
                  type={showPassword.confirm ? "text" : "password"}
                  placeholder="Re-enter new password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => ({
                      ...prev,
                      confirm: !prev.confirm,
                    }))
                  }
                  className="absolute right-3 top-7"
                >
                  {showPassword.confirm ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {manualError && (
                <p className="mt-2 text-sm text-red-500 text-center">
                  {manualError}
                </p>
              )}
            </div>

            <Button
              className="w-full py-5 mt-5 bg-green-500 text-white"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoadingButton color={"text-white"} />
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;
