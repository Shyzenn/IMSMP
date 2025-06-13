"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { formattedDate } from "@/lib/utils";
import { Column } from "@/lib/interfaces";
import TableComponent from "@/app/components/TableComponent";
import { CiSearch, CiEdit } from "react-icons/ci";
import { IoArchiveOutline } from "react-icons/io5";
import { IconType } from "react-icons/lib";
import SelectField from "@/app/components/SelectField";

interface ProductProps {
  id: string;
  product_name: string;
  category: string;
  quantity: number;
  price: number;
  releaseDate: Date;
  expiryDate: Date;
  icon: IconType[];
}

const columns: Column[] = [
  { label: "Product Name", accessor: "product_name" },
  { label: "Category", accessor: "category" },
  { label: "Quantity", accessor: "quantity" },
  { label: "Price", accessor: "price" },
  { label: "Release Date", accessor: "releaseDate" },
  { label: "Expiry Date", accessor: "expiryDate" },
  {
    label: "Actions",
    accessor: "actions",
    render: (row) => (
      <div className="flex gap-4 items-center">
        <CiEdit
          className="text-xl cursor-pointer hover:text-blue-600"
          onClick={() => console.log("Search clicked for:", row.id)}
        />
        <IoArchiveOutline
          className="text-xl cursor-pointer hover:text-green-600"
          onClick={() => console.log("Filter clicked for:", row.id)}
        />
      </div>
    ),
  },
];

const fetchProducts = async (): Promise<ProductProps[]> => {
  const { data } = await axios.get("/api/inventory");
  return Array.isArray(data) ? data : [];
};

const Inventory: React.FC = () => {
  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const formattedProducts = products.map((product) => ({
    ...product,
    releaseDate: formattedDate(product.releaseDate),
    expiryDate: formattedDate(product.expiryDate),
  }));

  if (isLoading) return <p>Loading products...</p>;
  if (isError) return <p>Failed to load products.</p>;

  return (
    <div
      className="p-6 bg-white overflow-auto"
      style={{ height: "calc(98vh - 64px)" }}
    >
      <>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Inventory</h2>
          <div className="w-[30rem] border px-6 rounded-full flex items-center gap-2">
            <CiSearch className="text-xl text-gray-400" />
            <input
              placeholder="Search..."
              className="w-full py-2 outline-none"
            />
          </div>

          <div>
            <SelectField
              label="Select a category"
              option={[
                { label: "Antibiotics", value: "Antibiotics" },
                { label: "Pain Killer", value: "Pain_Killer" },
              ]}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <TableComponent
            data={formattedProducts}
            columns={columns}
            interactiveRows={false}
            colorCodeExpiry={false}
            noDataMessage={
              formattedProducts.length === 0
                ? "No Products Available"
                : undefined
            }
          />
        </div>
      </>
    </div>
  );
};

export default Inventory;
