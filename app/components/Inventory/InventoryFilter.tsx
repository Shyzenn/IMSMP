"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import SelectField from "../SelectField";

const InventoryFilter = () => {
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
        { label: "Antibiotic", value: "ANTIBIOTIC" },
        { label: "Gastrointestinal", value: "GASTROINTESTINAL" },
        { label: "Pain Reliever", value: "PAIN_RELIEVER" },
        { label: "Anti-inflammatory", value: "ANTI_INFLAMMATORY" },
        { label: "General Medication", value: "GENERAL_MEDICATION" },
      ]}
    />
  );
};

export default InventoryFilter;
