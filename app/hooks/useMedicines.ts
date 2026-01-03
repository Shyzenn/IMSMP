"use client";

import { ProductData } from "@/lib/interfaces";
import { useInfiniteQuery } from "@tanstack/react-query";

interface UseMedicinesParams {
  searchTerm?: string;
  selectedFilters?: string[] | null;
  requiresPrescription?: boolean | null;
}

interface MedicineResponse {
  items: ProductData[];
  nextPage: number | null;
}

export const useMedicines = ({
  searchTerm,
  selectedFilters,
  requiresPrescription,
}: UseMedicinesParams) => {
  return useInfiniteQuery<MedicineResponse, Error>({
    queryKey: ["medicines", searchTerm, selectedFilters, requiresPrescription],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedFilters && selectedFilters.length > 0) {
        selectedFilters.forEach((filter) => {
          params.append("category", filter);
        });
      }
      if (requiresPrescription !== null && requiresPrescription !== undefined) {
        params.append("requiresPrescription", String(requiresPrescription));
      }
      params.append("page", String(pageParam));
      params.append("limit", "25");

      const res = await fetch(`/api/product/medicines?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch medicines");
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    staleTime: 60_000,
  });
};
