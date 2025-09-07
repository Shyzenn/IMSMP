import Header from "@/app/components/auditLog/Header";
import AuditLogTable from "@/app/components/auditLog/table/Data";
import Pagination from "@/app/components/Pagination";
import { TableRowSkeleton } from "@/app/components/Skeleton";
import { fetchAuditPages } from "@/lib/action/get";
import React, { Suspense } from "react";

const skeletonHeaders = [
  { key: "id", label: "Log ID" },
  { key: "action", label: "Event" },
  { key: "description", label: "Description" },
  { key: "createdAt", label: "Timestamp" },
  { key: "user", label: "Performed By" },
  { key: "entityType", label: "Target Type" },
  { key: "entityId", label: "Target ID" },
];

const page = async (props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    filter?: string;
  }>;
}) => {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const page = searchParams?.page;
  const filter = searchParams?.filter || "all";

  const currentPage = Number(page);
  const totalPages = await fetchAuditPages(query, filter);

  return (
    <div
      className="p-6 bg-white overflow-auto rounded-md"
      style={{ height: "calc(94vh - 70px)" }}
    >
      <Header />
      <div className="mt-4">
        <Suspense
          key={`${query}-${filter}-${currentPage}`}
          fallback={<TableRowSkeleton headerLabel={skeletonHeaders} />}
        >
          <AuditLogTable
            query={query}
            filter={filter}
            currentPage={currentPage}
          />
        </Suspense>
      </div>
      <div className="mt-6 flex justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
};

export default page;
