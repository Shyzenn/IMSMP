"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import SelectField from "../../SelectField";
import { useQuery } from "@tanstack/react-query";
import { ProductCategory } from "@prisma/client";

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

  const { data: categories } = useQuery<ProductCategory[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/product/category");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  return (
    <SelectField
      label="Select a category"
      value={selectedFilter}
      onChange={handleCategoryChange}
      option={
        categories
          ? [
              { label: "All", value: "all" },
              ...categories.map((cat) => ({
                label: cat.name,
                value: cat.name,
              })),
            ]
          : [{ label: "All", value: "all" }]
      }
    />
  );
};

export default InventoryFilter;
