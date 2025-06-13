"use client";

import { Column } from "@/lib/interfaces";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import TableComponent from "./TableComponent";
import { fetchExpiryProducts } from "@/lib/action";
import { formattedDate } from "@/lib/utils";

const columns: Column[] = [
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
    expiryDate: formattedDate(product.expiryDate),
  }));

  if (isLoading) return <p>Loading data...</p>;
  if (isError) return <p>Failed to load data.</p>;

  return (
    <div className="mx-4 max-h-[260px] overflow-auto">
      <TableComponent
        data={formattedData}
        columns={columns}
        title="Product Expiring Soon"
        interactiveRows={false}
        noDataMessage={
          expiryProducts.length === 0 ? "No Expiring Products" : undefined
        }
        colorCodeExpiry={true}
      />
    </div>
  );
};

export default ExpiryProducts;
