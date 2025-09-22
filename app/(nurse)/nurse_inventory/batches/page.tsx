import BatchTable from "@/app/components/Inventory/batches/BatchTable";
import InventoryHeader from "@/app/components/Inventory/products/InventoryHeader";
import Pagination from "@/app/components/Pagination";
import { TableRowSkeleton } from "@/app/components/Skeleton";
import { fetchBatchPages } from "@/lib/action/get";
import { inventorySkeletonHeaders } from "@/lib/utils";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";

const ProductBatch = async (props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    filter?: string;
    sort?: string;
    order?: string;
  }>;
}) => {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const page = searchParams?.page;
  const filter = searchParams?.filter;

  if (!filter || !page) {
    redirect(`/nurse_inventory/batches?query=&page=1&filter=all&sort=releaseDate&order=desc
  `);
  }

  const sortBy = searchParams?.sort || "createdAt";
  const sortOrder = (searchParams?.order as "asc" | "desc") || "desc";

  const currentPage = Number(page);
  const totalPages = await fetchBatchPages(query, filter);

  return (
    <div
      className="p-6 bg-white overflow-auto rounded-md"
      style={{ height: "calc(94vh - 70px)" }}
    >
      <InventoryHeader
        title={"Product Batches"}
        hasAddProduct={false}
        hasInventoryFilter={false}
      />

      <div className="overflow-x-auto">
        <Suspense
          key={`${currentPage}-${query}-${filter}-${sortBy}-${sortOrder}`}
          fallback={<TableRowSkeleton headerLabel={inventorySkeletonHeaders} />}
        >
          <BatchTable
            query={query}
            currentPage={currentPage}
            filter={filter}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        </Suspense>

        <div className="mt-6 flex items-center justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
};

export default ProductBatch;
