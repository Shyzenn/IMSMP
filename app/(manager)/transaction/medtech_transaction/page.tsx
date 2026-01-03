import Pagination from "@/app/components/ui/Pagination";
import { TableRowSkeleton } from "@/app/components/ui/Skeleton";
import MTTransactionTable from "@/app/components/transaction/table/MTTable";
import { fetchMTTransactionPages } from "@/lib/action/get";
import { transactionMTSkeletonHeaders } from "@/lib/utils";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";
import PageTableHeader from "@/app/components/ui/PageTableHeader";

async function Transaction(props: {
  searchParams: Promise<{
    query: string;
    page: string;
    filter: string;
    sort: string;
    order: string;
    from: string;
    to: string;
  }>;
}) {
  const searchParams = await props.searchParams;

  const query = searchParams?.query || "";
  const page = searchParams?.page;
  const filter = searchParams?.filter;
  const from = searchParams?.from;
  const to = searchParams?.to;

  if (!filter || !page) {
    redirect(
      `/transaction/medtech_transaction?page=1&filter=all&sort=createdAt&order=desc`
    );
  }

  const sortBy = searchParams?.sort || "createdAt";
  const sortOrder = (searchParams?.order as "asc" | "desc") || "desc";

  const currentPage = Number(page);
  const totalPages = await fetchMTTransactionPages(query, filter, {
    from,
    to,
  });

  return (
    <div
      className="p-6 bg-white overflow-auto rounded-md"
      style={{ height: "calc(94vh - 70px)" }}
    >
      <PageTableHeader
        searchPlaceholder="Search request number..."
        title="History"
        hasDateFilter={true}
        isMTTransactionFilter={true}
        medTechReport={true}
      />
      <div className="mt-4">
        <Suspense
          key={`${query}-${currentPage}-${sortBy}-${sortOrder}-${from}-${to}`}
          fallback={
            <TableRowSkeleton headerLabel={transactionMTSkeletonHeaders} />
          }
        >
          <MTTransactionTable
            query={query}
            currentPage={currentPage}
            filter={filter}
            sortBy={sortBy}
            sortOrder={sortOrder}
            dateRange={{
              from,
              to,
            }}
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
