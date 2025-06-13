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
import { UserFormValues } from "@/lib/interfaces";
import { ControllerRenderProps } from "react-hook-form";

interface SelectFieldProps {
  field?: ControllerRenderProps<UserFormValues, "role">;
  label: string;
  option: { label: string; value: string }[];
}

const SelectField = ({ field, label, option }: SelectFieldProps) => {
  return (
    <>
      <Select value={field?.value} onValueChange={field?.onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectGroup>
            <SelectLabel>{label}</SelectLabel>
            {option.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="hover:bg-gray-100"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
};

export default SelectField;
