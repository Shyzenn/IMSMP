import React, { Suspense } from "react";
import InventoryTable from "@/app/components/Inventory/products/InventoryTable";
import { TableRowSkeleton } from "@/app/components/Skeleton";
import Pagination from "@/app/components/Pagination";
import { fetchProductsPages } from "@/lib/action/get";
import { redirect } from "next/navigation";
import { inventorySkeletonHeaders } from "@/lib/utils";
import PageTableHeader from "@/app/components/PageTableHeader";

async function Inventory(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
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
    redirect(`/nurse_inventory/products?query=&page=1&filter=all&sort=releaseDate&order=desc
`);
  }

  const sortBy = searchParams?.sort || "createdAt";
  const sortOrder = (searchParams?.order as "asc" | "desc") || "desc";

  const currentPage = Number(page);
  const totalPages = await fetchProductsPages(query, filter);

  return (
    <div
      className="p-6 bg-white overflow-auto rounded-md"
      style={{ height: "calc(94vh - 70px)" }}
    >
      <PageTableHeader
        title="Products"
        hasAddProduct={true}
        isProductFilter={true}
      />

      <div className="overflow-x-auto">
        <Suspense
          key={`${currentPage}-${query}-${filter}-${sortBy}-${sortOrder}`}
          fallback={<TableRowSkeleton headerLabel={inventorySkeletonHeaders} />}
        >
          <InventoryTable
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
}

export default Inventory;
