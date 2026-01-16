"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import InventoryTable from "./InventoryTable";
import Pagination from "@/app/components/ui/Pagination";
import {
  GetProductsResponse,
  productService,
} from "@/services/product.service";

export default function InventoryClient({
  query,
  initialPage,
  filter,
  sortBy,
  sortOrder,
}: {
  query: string;
  initialPage: number;
  filter: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) {
  const [page, setPage] = useState(initialPage);

  const { data, isLoading } = useQuery<GetProductsResponse>({
    queryKey: ["products", query, page, filter, sortBy, sortOrder],
    queryFn: () =>
      productService.getProducts({
        query,
        page,
        filter,
        sortBy,
        sortOrder,
      }),
    placeholderData: keepPreviousData,
  });

  const { data: pagesData } = useQuery<{
    totalPages: number;
    totalProducts: number;
  }>({
    queryKey: ["product-pages", query, filter],
    queryFn: () =>
      productService.getProductPages({
        query,
        filter,
      }),
    placeholderData: keepPreviousData,
  });

  const totalPages = pagesData?.totalPages ?? 1;

  return (
    <div className="overflow-x-auto">
      <InventoryTable products={data?.data ?? []} isLoading={isLoading} />

      <div className="mt-6 flex justify-center">
        <Pagination
          totalPages={totalPages}
          isComponent
          currentPage={page}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
