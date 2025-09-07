"use client";

import React from "react";
import SelectField from "../SelectField";
import { useRouter, useSearchParams } from "next/navigation";

const AuditFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedFilter = searchParams.get("filter") || "all";

  const handleTypeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", value);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };
  return (
    <SelectField
      label="Select a category"
      value={selectedFilter}
      onChange={handleTypeChange}
      option={[
        { label: "All", value: "all" },
        { label: "Change Password", value: "ChangePassword" },
        { label: "Order Request", value: "OrderRequest" },
        { label: "Product", value: "Product" },
        { label: "Session", value: "Session" },
        { label: "Walkin Order", value: "WalkInOrder" },
      ]}
    />
  );
};

export default AuditFilter;
