"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductCategory } from "@prisma/client";
import TableFilterSelect from "../../TableFilterSelect";

const ProductFilter = () => {
  const { data: categories } = useQuery<ProductCategory[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/product/category");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  return (
    <TableFilterSelect
      dynamicOptions={
        categories?.map((cat) => ({ label: cat.name, value: cat.name })) || []
      }
    />
  );
};

export default ProductFilter;
