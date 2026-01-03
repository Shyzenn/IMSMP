"use client";

import { Column } from "@/lib/interfaces";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import axios from "axios";
import { expiryDate, formatPackageType, toTitleCase } from "@/lib/utils";
import { ExpiryProductsSkeleton } from "../ui/Skeleton";
import TableComponent from "../ui/TableComponent";

const columns: Column[] = [
  { label: "Product name", accessor: "productName" },
  { label: "Batch#", accessor: "batch_number" },
  { label: "Expiry Date", accessor: "expiryDate" },
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
      name: `${toTitleCase(product.name)} ${formatPackageType(
        product.dosageForm
      )}`,
    };
  });

  if (isLoading) return <ExpiryProductsSkeleton />;

  return (
    <div className="mx-4 overflow-auto">
      <TableComponent
        linkCell
        largeContainer={false}
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
