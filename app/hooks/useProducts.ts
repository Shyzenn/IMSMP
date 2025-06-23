import { ProductData } from "@/lib/interfaces";
import { useCallback, useEffect, useState } from "react";

export const useProducts = () => {
  const [products, setProducts] = useState<ProductData[]>([]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("api/product");
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(
          data.map((p) => ({
            id: p.id,
            productName: p.product_name,
            quantity: p.quantity.toString(),
            price: p.price,
          }))
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
