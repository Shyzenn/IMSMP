import { ProductData } from "@/lib/interfaces";
import { capitalLetter } from "@/lib/utils";
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

  const handleSelectProduct = (index: number, product: ProductData) => {
    const displayValue = `${product.product_name} ${product.strength ?? ""} ${
      capitalLetter(product.dosageForm) ?? ""
    }`.trim();
    setValue(
      `products.${index}.productId` as Path<T>,
      displayValue as PathValue<T, Path<T>>
    );

    clearErrors(`products.${index}.productId` as Path<T>);
    setDropdownIndex(null);

    setSelectedQuantity((prev) => ({
      ...prev,
      [index]: Number(product.quantity),
    }));
  };

  const handleInputChangeProduct = (index: number, value: string) => {
    const top10 = products.filter((product) =>
      product.product_name.toLowerCase().includes(value.toLowerCase())
    );
    setValue(
      `products.${index}.productId ` as Path<T>,
      value as PathValue<T, Path<T>>
    );
    setDropdownIndex(index);
    setFilteredProducts(top10);

    if (value === "") {
      setDropdownIndex(null);
    }
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
