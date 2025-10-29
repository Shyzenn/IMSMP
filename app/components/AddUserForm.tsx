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
} from "react-hook-form";
import { TSignUpSchema } from "@/lib/types";
import FormField from "./FormField";
import SelectField from "./SelectField";

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
  return (
    <>
      <Card className="w-[400px] bg-white ">
        <div className="flex justify-end">
          <button className="mt-2 mx-2" onClick={() => setIsOpen(false)}>
            <RxCross2 />
          </button>
        </div>

        <CardHeader>
          <CardTitle className="text-center text-2xl">Add User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid w-full items-center gap-4">
              <div className="flex gap-4">
                <FormField label="First Name" error={errors.firstName?.message}>
                  <Input
                    {...register("firstName")}
                    id="firstName"
                    placeholder="enter first name"
                    type="text"
                  />
                </FormField>

                <FormField label="Last Name" error={errors.lastName?.message}>
                  <Input
                    {...register("lastName")}
                    id="lastName"
                    placeholder="enter last name"
                    type="text"
                  />
                </FormField>
              </div>
              <FormField label="Username" error={errors.username?.message}>
                <Input
                  {...register("username")}
                  id="username"
                  placeholder="username"
                  type="text"
                />
              </FormField>

              <FormField label="Email" error={errors.email?.message}>
                <Input
                  {...register("email")}
                  id="email"
                  placeholder="example@email.com"
                  type="email"
                />
              </FormField>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Types</Label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <SelectField
                      field={field}
                      label="select user type"
                      option={[
                        { label: "Manager", value: "Manager" },
                        { label: "Nurse", value: "Nurse" },
                        {
                          label: "Pharmacist Staff",
                          value: "Pharmacist_Staff",
                        },
                        { label: "Cashier", value: "Cashier" },
                      ]}
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
              className="w-full py-5 mt-8 text-center bg-buttonBgColor text-white hover:bg-buttonHover"
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
