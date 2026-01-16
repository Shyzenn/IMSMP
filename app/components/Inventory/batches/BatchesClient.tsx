"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Pagination from "@/app/components/ui/Pagination";
import { GetBatchesResponse, productService } from "@/services/product.service";
import BatchTable from "./BatchTable";

export default function BatchClient({
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

  const { data, isLoading } = useQuery<GetBatchesResponse>({
    queryKey: ["batches", query, page, filter, sortBy, sortOrder],
    queryFn: () =>
      productService.getBatches({
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
      productService.getBatchesPages({
        query,
        filter,
      }),
    placeholderData: keepPreviousData,
  });

  const totalPages = pagesData?.totalPages ?? 1;

  return (
    <div className="overflow-x-auto">
      <BatchTable batches={data?.data ?? []} isLoading={isLoading} />

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
