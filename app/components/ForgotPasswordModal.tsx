"use client";

import CancelButton from "@/app/components/CancelButton";
import AddButton from "@/app/components/Button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  otpSchema,
  resetPasswordSchema,
  TForgotPassword,
  TOtp,
  TResetPassword,
} from "@/lib/types";
import toast from "react-hot-toast";
import LoadingButton from "@/components/loading-button";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Eye, EyeOff } from "lucide-react";

const ForgotPasswordModal = ({
  setShowModal,
}: {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [step2Error, setStep2Error] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  // Step 1: Request OTP
  const formStep1 = useForm<TForgotPassword>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const handleRequestOTP = async (values: TForgotPassword) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setEmail(values.email);
      setStep(2);
      setStep1Error(null);
      setResendTimer(60);
    } catch (err) {
      const error = err as Error;
      setStep1Error(error.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 2 && resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }

    return undefined;
  }, [step, resendTimer]);

  // Step 2: Verify OTP
  const formStep2 = useForm<TOtp>({
    resolver: zodResolver(otpSchema),
  });

  const handleVerifyOTP = async (values: TOtp) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify_otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: values.otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP");

      setStep(3);
      setStep2Error(null); // clear step 2 errors
    } catch (err) {
      const error = err as Error;
      setStep2Error(error.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const formStep3 = useForm<TResetPassword>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleResetPassword = async (values: TResetPassword) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: values.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast("✅ Password reset successful");
      setShowModal(false);
    } catch (err) {
      const error = err as Error;
      toast(error.message || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-[400px]">
        {/* Step 1 */}
        {step === 1 && (
          <form onSubmit={formStep1.handleSubmit(handleRequestOTP)}>
            <h2 className="text-lg font-semibold mb-4">Forgot Password</h2>
            <Input
              placeholder="Enter email"
              type="email"
              {...formStep1.register("email")}
            />
            {step1Error && (
              <p className="text-sm text-red-500 my-2">{step1Error}</p>
            )}
            <div className="flex justify-end gap-4 mt-4">
              <CancelButton onClick={() => setShowModal(false)} />
              <AddButton
                label={
                  loading ? <LoadingButton color="text-white" /> : "Confirm"
                }
                className="px-6"
                type="submit"
              />
            </div>
          </form>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <form onSubmit={formStep2.handleSubmit(handleVerifyOTP)}>
            <h2 className="text-lg font-semibold mb-4">Enter OTP</h2>
            <p className="text-sm text-gray-600 mb-2">
              An 8-digit OTP was sent to <b>{email}</b>. Enter the code here to
              proceed.
            </p>

            <Controller
              control={formStep2.control}
              name="otp"
              render={({ field }) => (
                <div className="flex flex-col items-center my-4">
                  <InputOTP
                    maxLength={8}
                    value={field.value || ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                  >
                    <InputOTPGroup>
                      {Array.from({ length: 8 }).map((_, index) => (
                        <InputOTPSlot key={index} index={index} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                  {step2Error && (
                    <p className="text-sm text-red-500 mt-2 text-center">
                      {step2Error}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Resend OTP */}
            <p className="text-sm text-gray-600 text-center mt-3">
              {resendTimer > 0 ? (
                <>Resend OTP in {resendTimer}s</>
              ) : (
                <button
                  type="button"
                  className="text-blue-600 hover:underline"
                  onClick={() => handleRequestOTP({ email })}
                >
                  Resend OTP
                </button>
              )}
            </p>

            <button
              type="submit"
              className={`w-full  rounded-md text-white py-2 mt-4 ${
                formStep2.getValues("otp")?.length !== 8
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-buttonBgColor hover:bg-buttonHover duration-300 ease-in-out"
              }`}
              disabled={loading || formStep2.getValues("otp")?.length !== 8}
            >
              {loading ? (
                <LoadingButton color="text-white" />
              ) : (
                "Verify email OTP"
              )}
            </button>
          </form>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <form onSubmit={formStep3.handleSubmit(handleResetPassword)}>
            <h2 className="text-lg font-semibold mb-4">New Password</h2>
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Input
                  placeholder="Enter new password"
                  {...formStep3.register("newPassword")}
                  type={showPassword ? "text" : "password"}
                />
                {formStep3.formState.errors.newPassword && (
                  <p className="text-sm text-red-500">
                    {formStep3.formState.errors.newPassword.message}
                  </p>
                )}
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <Input
                  placeholder="Confirm password"
                  {...formStep3.register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                />
                {formStep3.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {formStep3.formState.errors.confirmPassword.message}
                  </p>
                )}
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-end justify-end mt-4">
              <AddButton
                label={loading ? <LoadingButton color="text-white" /> : "Save"}
                className="px-6 py-2"
                type="submit"
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
