"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";

interface SearchableSelectProps<T extends FieldValues> {
  field?: ControllerRenderProps<T, Path<T>>;
  label: string;
  option: { label: string; value: string }[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const SearchableSelect = <T extends FieldValues>({
  field,
  label,
  option,
  value,
  onChange,
  disabled,
  placeholder = "Search...",
}: SearchableSelectProps<T>) => {
  const [open, setOpen] = React.useState(false);
  const currentValue = field?.value || value || "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between font-normal ${
            currentValue ? "" : "text-gray-500"
          }`}
          disabled={disabled}
        >
          {currentValue
            ? option.find((opt) => opt.value === currentValue)?.label
            : label}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {option.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.value}
                  onSelect={(selectedValue) => {
                    const selected = option.find(
                      (opt) =>
                        opt.value.toLowerCase() === selectedValue.toLowerCase()
                    );
                    if (selected) {
                      field?.onChange(selected.value);
                      onChange?.(selected.value);
                    }
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentValue === opt.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchableSelect;
