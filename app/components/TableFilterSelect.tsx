"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import SelectField from "./SelectField";

interface FilterSelectProps {
  label: string;
  staticOptions?: { label: string; value: string }[];
  dynamicOptions?: { label: string; value: string }[];
}

const TableFilterSelect: React.FC<FilterSelectProps> = ({
  label,
  staticOptions,
  dynamicOptions,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedFilter = searchParams.get("filter") || "all";

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", value);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const options =
    dynamicOptions && dynamicOptions.length > 0
      ? [{ label: "All", value: "all" }, ...dynamicOptions]
      : staticOptions || [{ label: "All", value: "all" }];

  return (
    <SelectField
      label={label}
      value={selectedFilter}
      onChange={handleCategoryChange}
      option={options}
    />
  );
};

export default TableFilterSelect;
