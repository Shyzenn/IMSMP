import { ProductData } from "@/lib/interfaces";
import { useCallback, useEffect, useState } from "react";

export const useProducts = () => {
  const [products, setProducts] = useState<ProductData[]>([]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/product");
      const data: ProductData[] = await res.json();

      if (Array.isArray(data)) {
        setProducts(
          data.map((p) => {
            const totalQuantity =
              p.batches
                ?.filter(
                  (batch) =>
                    batch.expiryDate && new Date(batch.expiryDate) >= new Date()
                )
                .reduce(
                  (acc: number, batch) => acc + (batch.quantity || 0),
                  0
                ) ?? 0;

            return {
              id: p.id,
              product_name: p.product_name,
              quantity: totalQuantity,
              strength: p.strength,
              dosageForm: p.dosageForm,
              price: p.price,
              genericName: p.genericName,
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
