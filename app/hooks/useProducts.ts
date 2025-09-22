import { ProductData } from "@/lib/interfaces";
import { useCallback, useEffect, useState } from "react";

interface ProductApiResponse {
  id: number;
  product_name: string;
  price: number | string;
  batches?: { quantity: number, expiryDate: Date }[];
}

export const useProducts = () => {
  const [products, setProducts] = useState<ProductData[]>([]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/product");
      const data: ProductApiResponse[] = await res.json();

      if (Array.isArray(data)) {
        setProducts(
          data.map((p) => {
           const totalQuantity = p.batches
            ?.filter(batch => {
              return new Date(batch.expiryDate) >= new Date();
            })
            .reduce((acc: number, batch) => acc + (batch.quantity || 0), 0) ?? 0;

            return {
              id: p.id,
              productName: p.product_name,
              quantity: totalQuantity,
              price: Number(p.price), 
            };
          })
        );
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, fetchProducts };
};
