import BatchClient from "@/app/components/Inventory/batches/BatchesClient";
import PageTableHeader from "@/app/components/ui/PageTableHeader";
import { redirect } from "next/navigation";

type SearchParams = {
  query?: string;
  page?: string;
  filter?: string;
  sort?: string;
  order?: string;
};

async function ProductBatch({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const query = params.query ?? "";
  const page = Number(params.page ?? 1);
  const filter = params.filter ?? "all";
  const sortBy = params.sort ?? "createdAt";
  const sortOrder = (params.order as "asc" | "desc") ?? "desc";

  if (!filter || !page) {
    redirect(`/inventory/batches?query=&page=1&filter=all&sort=number&order=desc
  `);
  }

  return (
    <div
      className="p-6 bg-white overflow-auto rounded-md"
      style={{ height: "calc(94vh - 70px)" }}
    >
      <PageTableHeader
        searchPlaceholder="Search product name..."
        title={"Product Batches"}
        hasAddProduct={false}
        isBatchFilter={true}
        batchExport={true}
      />

      <BatchClient
        query={query}
        initialPage={page}
        filter={filter}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    </div>
  );
}

export default ProductBatch;
