import LoadingButton from "@/components/loading-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RxCross2 } from "react-icons/rx";
import {
  Control,
  Controller,
  FieldErrors,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormReset,
} from "react-hook-form";
import { TSignUpSchema } from "@/lib/types";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import FormField from "../ui/FormField";
import SelectField from "../ui/SelectField";

interface AddUserFormProps {
  setIsOpen: (isOpen: boolean) => void;
  handleSubmit: UseFormHandleSubmit<TSignUpSchema>;
  onSubmit: SubmitHandler<TSignUpSchema>;
  register: UseFormRegister<TSignUpSchema>;
  errors: FieldErrors<TSignUpSchema>;
  control: Control<TSignUpSchema>;
  isSubmitting: boolean;
  reset: UseFormReset<TSignUpSchema>;
}

const AddUserForm: React.FC<AddUserFormProps> = ({
  setIsOpen,
  handleSubmit,
  onSubmit,
  register,
  errors,
  control,
  isSubmitting,
  reset,
}) => {
  const { data: session } = useSession();

  const handleClose = () => {
    reset();
    setIsOpen(false);
  };

  useEffect(() => {
    if (session?.user.role === "SuperAdmin") {
      reset((prev) => ({
        ...prev,
        role: "Manager",
      }));
    }
  }, [session, reset]);

  return (
    <>
      <Card className="w-[400px] bg-white ">
        <div className="flex justify-end">
          <button className="mt-2 mx-2" onClick={handleClose}>
            <RxCross2 />
          </button>
        </div>

        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {session?.user.role === "Manager" ? "Add User" : "Add Manager"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid w-full items-center gap-4">
              <FormField label="First Name" error={errors.firstName?.message}>
                <Input
                  {...register("firstName")}
                  id="firstName"
                  placeholder="Enter firstname"
                  type="text"
                />
              </FormField>
              <FormField label="Middle Name" error={errors.middleName?.message}>
                <Input
                  {...register("middleName")}
                  id="MiddleName"
                  placeholder="Enter middlename (Optional)"
                  type="text"
                />
              </FormField>
              <FormField label="Last Name" error={errors.lastName?.message}>
                <Input
                  {...register("lastName")}
                  id="lastName"
                  placeholder="Enter lastname"
                  type="text"
                />
              </FormField>

              <FormField label="Username" error={errors.username?.message}>
                <Input
                  {...register("username")}
                  id="username"
                  placeholder="Username"
                  type="text"
                />
              </FormField>

              <FormField label="Email" error={errors.email?.message}>
                <Input
                  {...register("email")}
                  id="email"
                  placeholder="Example@email.com"
                  type="email"
                />
              </FormField>

              <div className="flex flex-col space-y-1.5 text-sm mb-[3px] text-gray-700">
                <Label htmlFor="password">Types</Label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <SelectField
                      field={field}
                      label="Select User Type"
                      option={
                        session?.user.role === "Manager"
                          ? [
                              { label: "Nurse", value: "Nurse" },
                              {
                                label: "Pharmacist Staff",
                                value: "Pharmacist_Staff",
                              },
                              { label: "Cashier", value: "Cashier" },
                              { label: "Med Tech", value: "MedTech" },
                            ]
                          : [{ label: "Manager", value: "Manager" }]
                      }
                    />
                  )}
                />
                {errors.role && (
                  <p className="mt-2 text-sm text-red-500">
                    {`${errors.role.message}`}
                  </p>
                )}
              </div>
            </div>
            <Button
              className="w-full py-5 mt-8 text-cE bg-buttonBgColor text-white hover:bg-buttonHover"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? <LoadingButton color="text-white" /> : "Sign Up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AddUserForm;
