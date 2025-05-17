import { CiCalendar } from "react-icons/ci";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UseFormRegister } from "react-hook-form";
import { TAddProductSchema } from "@/lib/types";

interface InputFieldProps {
  label: string;
  name: string;
  type: "text" | "date" | "select" | "number";
  placeholder: string;
  options?: { label: string; value: string }[];
  error?: string;
  register?: UseFormRegister<TAddProductSchema>;
}
const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, name, type, placeholder, options = [], register }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">{label}</label>

        {type === "select" ? (
          <Select {...register}>
            <SelectTrigger className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-md">
              <SelectGroup>
                <SelectLabel>{label}</SelectLabel>
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="hover:bg-gray-100"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : type === "date" ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left font-normal"
              >
                <CiCalendar className="mr-2" />
                <span>{placeholder}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" {...register} initialFocus />
            </PopoverContent>
          </Popover>
        ) : (
          <Input
            ref={ref}
            type={type}
            name={name}
            placeholder={placeholder}
            className="appearance-none border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
            {...register}
          />
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
