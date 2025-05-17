"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface ProductProps {
  id: string;
  product_name: string;
  category: string;
  quantity: number;
  price: number;
  releaseDate: Date;
  expiryDate: Date;
}

const fetchProducts = async (): Promise<ProductProps[]> => {
  const { data } = await axios.get("/api/product");
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

  if (isLoading) return <p>Loading products...</p>;
  if (isError) return <p>Failed to load products.</p>;

  return (
    <div className="p-6">
      {products.length === 0 ? (
        <p>No Product Available</p>
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-4">Inventory</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Product Name</th>
                  <th className="border p-2">Category</th>
                  <th className="border p-2">Quantity</th>
                  <th className="border p-2">Price</th>
                  <th className="border p-2">Release Date</th>
                  <th className="border p-2">Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="text-center">
                    <td className="border p-2">{product.product_name}</td>
                    <td className="border p-2">
                      {product.category === "PAIN_RELIEVER"
                        ? "PAIN RELIEVER"
                        : product.category}
                    </td>
                    <td className="border p-2">{product.quantity}</td>
                    <td className="border p-2">₱{product.price}</td>
                    <td className="border p-2">
                      {new Date(product.releaseDate).toLocaleDateString()}
                    </td>
                    <td className="border p-2">
                      {new Date(product.expiryDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Inventory;
