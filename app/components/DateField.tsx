import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

interface DateFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  error?: string;
  className?: string;
}

const DateField = <T extends FieldValues>({
  control,
  name,
  label,
  error,
  className = "",
}: DateFieldProps<T>) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          // Safely handle the date value
          const dateValue = field.value ? new Date(field.value) : undefined;
          const isValidDate = dateValue && !isNaN(dateValue.getTime());

          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={className}>
                  {isValidDate ? format(dateValue, "PPP") : "Pick a date"}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={isValidDate ? dateValue : undefined}
                  onSelect={field.onChange}
                  className="rounded-md border shadow-sm"
                  captionLayout="dropdown"
                  fromYear={1900}
                  toYear={new Date().getFullYear() + 50}
                />
              </PopoverContent>
            </Popover>
          );
        }}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default DateField;
