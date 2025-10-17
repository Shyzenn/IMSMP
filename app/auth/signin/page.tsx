"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInSchema, TSignInSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { handleCredentialsSignIn } from "@/app/authActions";
import { useState } from "react";
import LoadingButton from "@/components/loading-button";
import Image from "next/image";
import MacoleenLogo from "@/public/macoleens_logo.png";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Button } from "@/components/ui/button";

import ForgotPasswordModal from "@/app/components/ForgotPasswordModal";
import { useRouter } from "next/navigation";

const Login = () => {
  const [manualError, setManualError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TSignInSchema>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (values: TSignInSchema) => {
    try {
      const result = await handleCredentialsSignIn(values);
      if (result?.message) {
        setManualError(result.message);
      }
      if (result?.redirectUrl) {
        window.location.href = result.redirectUrl;
      }

      router.refresh();
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.", error);
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
          <CardTitle className="text-center text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  {...register("email")}
                  id="email"
                  placeholder="example@email.com"
                  type="email"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col space-y-1.5 relative">
                <Label htmlFor="password">Password</Label>
                <Input
                  {...register("password")}
                  id="password"
                  placeholder="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword((prev) => !prev);
                  }}
                  className="absolute right-3 top-6"
                >
                  {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
                <div className="flex items-center justify-between">
                  {errors.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                  <button
                    className="text-sm text-blue-500 ml-1 cursor-pointer hover:underline"
                    type="button"
                    onClick={() => setShowModal((prev) => !prev)}
                  >
                    forgot password?
                  </button>
                </div>
              </div>

              {manualError && (
                <p className="mt-2 text-sm text-red-500 text-center">
                  {manualError}
                </p>
              )}
            </div>

            <Button
              className="w-full py-5 mt-8 bg-buttonBgColor hover:bg-buttonHover text-white duration-300 ease-in-out"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? <LoadingButton color={"text-white"} /> : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {showModal && <ForgotPasswordModal setShowModal={setShowModal} />}
    </div>
  );
};

export default Login;
