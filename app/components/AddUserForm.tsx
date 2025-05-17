"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingButton from "@/components/loading-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { useState } from "react";
import {
  Control,
  Controller,
  FieldErrors,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form";
import { TSignUpSchema } from "@/lib/types";

interface AddUserFormProps {
  setIsOpen: (isOpen: boolean) => void;
  handleSubmit: UseFormHandleSubmit<TSignUpSchema>;
  onSubmit: SubmitHandler<TSignUpSchema>;
  register: UseFormRegister<TSignUpSchema>;
  errors: FieldErrors<TSignUpSchema>;
  control: Control<TSignUpSchema>;
  isSubmitting: boolean;
}

const AddUserForm: React.FC<AddUserFormProps> = ({
  setIsOpen,
  handleSubmit,
  onSubmit,
  register,
  errors,
  control,
  isSubmitting,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
      <Card className="w-[400px] bg-white ">
        <div className="flex justify-end">
          <button
            className="mt-2 mx-2 text-2xl"
            onClick={() => setIsOpen(false)}
          >
            <RxCross2 />
          </button>
        </div>

        <CardHeader>
          <CardTitle className="text-center text-2xl">Add User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  {...register("username")}
                  id="username"
                  placeholder="username"
                  type="text"
                />
                {errors.username && (
                  <p className="mt-2 text-sm text-red-500">
                    {`${errors.username.message}`}
                  </p>
                )}
              </div>

              <div className="flex flex-col space-y-1.5">
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a User Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectGroup>
                          <SelectLabel>Types</SelectLabel>
                          <SelectItem
                            value="Manager"
                            className="hover:bg-gray-100"
                          >
                            Manager
                          </SelectItem>
                          <SelectItem
                            value="Nurse"
                            className="hover:bg-gray-100"
                          >
                            Nurse
                          </SelectItem>
                          <SelectItem
                            value="Pharmacist_Staff"
                            className="hover:bg-gray-100"
                          >
                            Pharmacist Staff
                          </SelectItem>
                          <SelectItem
                            value="Cashier"
                            className="hover:bg-gray-100"
                          >
                            Cashier
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role && (
                  <p className="mt-2 text-sm text-red-500">
                    {`${errors.role.message}`}
                  </p>
                )}
              </div>

              <div className="flex flex-col space-y-1.5 relative">
                <Label htmlFor="password">Password</Label>
                <Input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="password"
                  className=""
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
                {errors.password && (
                  <p className="mt-2 text-sm text-red-500">
                    {`${errors.password.message}`}
                  </p>
                )}
              </div>

              <div className="flex flex-col space-y-1.5 relative">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  {...register("confirmPassword")}
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="confirm password"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmPassword((prev) => !prev);
                  }}
                  className="absolute right-3 top-6"
                >
                  {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-500">
                    {`${errors.confirmPassword.message}`}
                  </p>
                )}
              </div>
            </div>
            <Button
              className="w-full py-5 mt-14 text-center bg-green-500 text-white"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? <LoadingButton /> : "Sign Up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AddUserForm;
