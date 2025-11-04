"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect, useTransition } from "react";
import { MultiSelect } from "./multi-select";

interface FilterSelectProps {
  staticOptions?: { label: string; value: string }[];
  dynamicOptions?: { label: string; value: string }[];
}

const TableFilterSelect: React.FC<FilterSelectProps> = ({
  staticOptions,
  dynamicOptions,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const getInitialValues = () => {
    const urlFilter = searchParams.get("filter");
    if (!urlFilter || urlFilter === "all") return [];
    return urlFilter.split(",").filter(Boolean);
  };

  const [selectedValues, setSelectedValues] =
    useState<string[]>(getInitialValues);

  const options = dynamicOptions?.length ? dynamicOptions : staticOptions || [];

  const handleChange = (values: string[]) => {
    const filtered = values.filter((v) => v !== "all");
    setSelectedValues(filtered);

    const params = new URLSearchParams(searchParams.toString());

    if (filtered.length === 0) {
      params.delete("filter");
    } else {
      params.set("filter", filtered.join(","));
    }

    params.set("page", "1");

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  // Sync with URL changes
  useEffect(() => {
    const urlFilter = searchParams.get("filter");
    const urlValues =
      !urlFilter || urlFilter === "all"
        ? []
        : urlFilter.split(",").filter(Boolean);

    setSelectedValues(urlValues);
  }, [searchParams]);

  return (
    <MultiSelect
      options={options}
      onValueChange={handleChange}
      value={selectedValues}
      placeholder="Select categories..."
      disabled={isPending}
      hideSelectAll
    />
  );
};

export default TableFilterSelect;
