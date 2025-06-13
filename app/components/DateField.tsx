import { Input } from "@/components/ui/input";
import { TAddProductSchema } from "@/lib/types";
import React from "react";
import { Control, Controller } from "react-hook-form";

interface DateFieldProps {
  label: string;
  control: Control<TAddProductSchema>;
  name: keyof TAddProductSchema;
  error?: string;
}

const DateField = ({ label, control, name, error }: DateFieldProps) => {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div className="relative w-full">
            <Input
              type="date"
              value={
                field.value instanceof Date
                  ? field.value.toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => field.onChange(new Date(e.target.value))}
              className="w-full cursor-pointer"
              onClick={(e) =>
                e.currentTarget.showPicker ? e.currentTarget.showPicker() : null
              }
            />
          </div>
        )}
      />
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default DateField;
