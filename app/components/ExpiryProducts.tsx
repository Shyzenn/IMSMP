"use client";

import { Column } from "@/lib/interfaces";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import TableComponent from "./TableComponent";
import { fetchExpiryProducts, formattedDate } from "@/lib/utils";

const colums: Column[] = [
  { label: "Product name", accessor: "name" },
  { label: "Expiry Date", accessor: "expiryDate" },
  { label: "Quantity", accessor: "quantity" },
  { label: "Categories", accessor: "category" },
];

const ExpiryProducts = () => {
  const {
    data: expiryProducts = [],
    isError,
    isLoading,
  } = useQuery({
    queryFn: fetchExpiryProducts,
    queryKey: ["expiry_products"],
  });

  const formattedData = expiryProducts.map((product) => ({
    ...product,
    expiryProducts: formattedDate(product.expiry_products),
  }));

  if (isLoading) return <p>Loading data...</p>;
  if (isError) return <p>Failed to load data.</p>;

  return (
    <div className="mx-4 max-h-[180px] overflow-auto">
      <TableComponent
        data={formattedData}
        columns={colums}
        title="Product Expiring Soon"
        interactiveRows={false}
      />
    </div>
  );
};

export default ExpiryProducts;
