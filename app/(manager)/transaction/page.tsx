import Pagination from "@/app/components/Pagination";
import { TableRowSkeleton } from "@/app/components/Skeleton";
import TransactionHeader from "@/app/components/transaction/Header";
import TransactionTable from "@/app/components/transaction/table/Table";
import { fetchTransactionPages } from "@/lib/action/get";
import { transactionSkeletonHeaders } from "@/lib/utils";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";

async function Transaction(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    totalPages?: string;
    filter?: string;
    sort?: string;
    order?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const page = searchParams?.page;
  const filter = searchParams?.filter;

  if (!filter || !page) {
    redirect(`/transaction?page=1&filter=all&sort=createdAt&order=desc`);
  }

  const sortBy = searchParams?.sort || "createdAt";
  const sortOrder = (searchParams?.order as "asc" | "desc") || "desc";

  const currentPage = Number(page);
  const totalPages = await fetchTransactionPages(query, filter);

  return (
    <div
      className="p-6 bg-white overflow-auto rounded-md"
      style={{ height: "calc(94vh - 70px)" }}
    >
      <TransactionHeader />
      <div className="mt-4">
        <Suspense
          key={`${query}-${currentPage}-${sortBy}-${sortOrder}`}
          fallback={
            <TableRowSkeleton headerLabel={transactionSkeletonHeaders} />
          }
        >
          <TransactionTable
            query={query}
            currentPage={currentPage}
            filter={filter}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        </Suspense>
      </div>
      <div className="mt-6 flex items-center justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}

export default Transaction;
