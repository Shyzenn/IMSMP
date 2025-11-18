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
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";

interface SelectFieldProps<T extends FieldValues> {
  field?: ControllerRenderProps<T, Path<T>>;
  label: string;
  option: { label: string; value: string }[];
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  inputWidth?: string;
  disabled?: boolean;
}

const SelectField = <T extends FieldValues>({
  field,
  label,
  option,
  value,
  onChange,
  defaultValue,
  inputWidth,
  disabled,
}: SelectFieldProps<T>) => {
  return (
    <Select
      value={field?.value || value || undefined}
      onValueChange={field?.onChange ?? onChange}
      defaultValue={defaultValue}
      disabled={disabled}
    >
      <SelectTrigger className={`${inputWidth}`}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent className="bg-white">
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {option.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectField;
