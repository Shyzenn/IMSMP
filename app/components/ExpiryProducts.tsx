"use client";

import { Column } from "@/lib/interfaces";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import TableComponent from "./TableComponent";
import axios from "axios";
import { ExpiryProductsSkeleton } from "./Skeleton";
import { capitalLetter, expiryDate } from "@/lib/utils";

const columns: Column[] = [
  { label: "Product name", accessor: "name" },
  { label: "Batch#", accessor: "batch_number" },
  { label: "Expiry Date", accessor: "expiryDate" },
  { label: "Quantity", accessor: "quantity" },
  { label: "Categories", accessor: "category" },
];

const fetchExpiryProducts = async () => {
  const { data } = await axios.get("api/manager/expiry_products");
  return Array.isArray(data) ? data : [];
};

const ExpiryProducts = () => {
  const { data: expiryProducts = [], isLoading } = useQuery({
    queryFn: fetchExpiryProducts,
    queryKey: ["expiry_products"],
  });

  const formattedData = expiryProducts.map((product) => {
    return {
      ...product,
      expiryDate: `in ${expiryDate(product.expiryDate)} days`,
      name: capitalLetter(product.name),
      category: capitalLetter(product.category),
    };
  });

  if (isLoading) return <ExpiryProductsSkeleton />;

  return (
    <div className="mx-4 overflow-auto">
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
