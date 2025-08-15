import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { capitalLetter } from "@/lib/utils";
import React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

type CategoryFieldProps<T extends FieldValues = FieldValues> = {
  label: string;
  control: Control<T>;
  name: Path<T>;
  error?: string;
  categoryLabel: string;
  items: string[];
};

const CategoryField = <T extends FieldValues>({
  control,
  error,
  label,
  name,
  categoryLabel,
  items,
}: CategoryFieldProps<T>) => {
  return (
    <div className="w-full">
      <label className="text-sm font-medium">{label}</label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={(val) => field.onChange(val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectGroup>
                <SelectLabel>{categoryLabel}</SelectLabel>
                {items.map((item) => (
                  <SelectItem key={item} value={item}>
                    {capitalLetter(item.replace("_", " "))}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default CategoryField;
