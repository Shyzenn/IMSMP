"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Pagination from "@/app/components/ui/Pagination";
import TransactionTable from "./table/Table";
import {
  GetTransactionResponse,
  transactionService,
} from "@/services/transaction.service";

export default function TransactionClient({
  query,
  initialPage,
  filter,
  sortBy,
  sortOrder,
  from,
  to,
}: {
  query: string;
  initialPage: number;
  filter: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  from: string;
  to: string;
}) {
  const [page, setPage] = useState(initialPage);

  const { data, isLoading } = useQuery<GetTransactionResponse>({
    queryKey: ["transaction", query, page, filter, sortBy, sortOrder, from, to],
    queryFn: () =>
      transactionService.getTransaction({
        query,
        page,
        filter,
        sortBy,
        sortOrder,
        from,
        to,
      }),
    placeholderData: keepPreviousData,
  });

  const { data: pagesData } = useQuery<{
    totalPages: number;
    totalTransaction: number;
  }>({
    queryKey: ["transaction-pages", query, filter, from, to],
    queryFn: () =>
      transactionService.getTransactionPages({
        query,
        filter,
        from,
        to,
      }),
    placeholderData: keepPreviousData,
  });

  const totalPages = pagesData?.totalPages ?? 1;

  const transactions = data?.data ?? [];

  return (
    <div className="overflow-x-auto">
      <TransactionTable transactions={transactions} isLoading={isLoading} />

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
