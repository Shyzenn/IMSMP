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

export type Option = {
  id: number;
  name: string;
};

type CategoryFieldProps<T extends FieldValues = FieldValues> = {
  label: string;
  control: Control<T>;
  name: Path<T>;
  error?: string;
  categoryLabel: string;
  items: Option[];
  hasAddButton?: boolean;
  categoryModal?: (open: boolean) => void;
};

const CategoryField = <T extends FieldValues>({
  control,
  error,
  label,
  name,
  categoryLabel,
  items,
  hasAddButton,
  categoryModal,
}: CategoryFieldProps<T>) => {
  return (
    <div className="w-full">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex ">
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Select
              value={field.value || ""}
              onValueChange={(val) => field.onChange(val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={categoryLabel} />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectGroup>
                  <SelectLabel>{categoryLabel}</SelectLabel>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.name}>
                      {capitalLetter(item.name)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {hasAddButton && categoryModal && (
          <button
            className="border ml-2 py-[5px] px-4 rounded-md bg-buttonBgColor text-white hover:bg-buttonHover"
            type="button"
            onClick={() => categoryModal(true)}
          >
            Add
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default CategoryField;
