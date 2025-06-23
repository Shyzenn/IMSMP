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
import { ControllerRenderProps } from "react-hook-form";
import { UserFormValues } from "@/lib/interfaces";

interface SelectFieldProps {
  field?: ControllerRenderProps<UserFormValues, "role">;
  label: string;
  option: { label: string; value: string }[];
  value?: string;
  onChange?: (value: string) => void;
}

const SelectField = ({
  field,
  label,
  option,
  value,
  onChange,
}: SelectFieldProps) => {
  return (
    <Select
      value={field?.value ?? value}
      onValueChange={field?.onChange ?? onChange}
    >
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
  );
};

export default SelectField;
