"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import SelectField from "../../SelectField";

const BatchFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedFilter = searchParams.get("filter") || "all";

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", value);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <SelectField
      label="Select a category"
      value={selectedFilter}
      onChange={handleCategoryChange}
      option={[
        { label: "All", value: "all" },
        { label: "Active", value: "Active" },
        { label: "Expiring", value: "Expiring" },
        { label: "Expired", value: "Expired" },
        { label: "Consumed", value: "Consumed" },
      ]}
    />
  );
};

export default BatchFilter;
