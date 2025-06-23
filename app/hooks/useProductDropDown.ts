import { ProductData } from "@/lib/interfaces";
import { useEffect, useRef, useState } from "react";
import {
  UseFormClearErrors,
  UseFormSetValue,
  FieldValues,
  Path,
  PathValue,
} from "react-hook-form";

export function useProductDropdown<T extends FieldValues>(
  products: ProductData[],
  setValue: UseFormSetValue<T>,
  clearErrors: UseFormClearErrors<T>
) {
  const [filteredProducts, setFilteredProducts] = useState<ProductData[]>([]);
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<
    Record<number, number>
  >({});
  const dropdownRefs = useRef<(HTMLLIElement | null)[]>([]);

  const handleFocus = (index: number) => {
    const top10 = products.slice(0, 10);
    setFilteredProducts(top10);
    setDropdownIndex(index);
  };
  

  const handleSelectProduct = (index: number, productName: string) => {
    setValue(`products.${index}.productId` as Path<T>, productName as PathValue<T, Path<T>>);
    clearErrors(`products.${index}.productId` as Path<T>);
    setDropdownIndex(null);

    const selectedProduct = products.find(
      (p) => p.productName.toLowerCase() === productName.toLowerCase()
    );

    if (selectedProduct) {
      setSelectedQuantity((prev) => ({
        ...prev,
        [index]: Number(selectedProduct.quantity),
      }));
    }
  };

  const handleInputChangeProduct = (index: number, value: string) => {
    const top10 = products.filter((product) =>
      product.productName.toLowerCase().includes(value.toLowerCase())
    );
    setValue(`products.${index}.productId` as Path<T>, value as PathValue<T, Path<T>>);
    setDropdownIndex(index);
    setFilteredProducts(top10);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownIndex !== null &&
        dropdownRefs.current[dropdownIndex] &&
        !dropdownRefs.current[dropdownIndex]?.contains(event.target as Node)
      ) {
        setDropdownIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownIndex]);

  return {
    dropdownIndex,
    filteredProducts,
    handleFocus,
    handleSelectProduct,
    handleInputChangeProduct,
    setFilteredProducts,
    selectedQuantity,
    setSelectedQuantity,
    setDropdownIndex,
    setValue,
    clearErrors,
    dropdownRefs,
  };
}
