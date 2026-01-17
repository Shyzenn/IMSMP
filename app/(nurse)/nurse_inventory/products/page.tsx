import InventoryClient from "@/app/components/Inventory/products/InventoryClient";
import PageTableHeader from "@/app/components/ui/PageTableHeader";
import { redirect } from "next/navigation";

type SearchParams = {
  query?: string;
  page?: string;
  filter?: string;
  sort?: string;
  order?: string;
};

async function Inventory({
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

  if (!params.page || !params.filter) {
    redirect(
      `/nurse_inventory/products?query=&page=1&filter=all&sort=createdAt&order=asc`
    );
  }

  return (
    <div className="p-6 bg-white overflow-auto rounded-md h-[calc(94vh-70px)]">
      <PageTableHeader
        title="Products"
        hasAddProduct
        isProductFilter
        productExport
        searchPlaceholder="Search product name..."
      />

      <InventoryClient
        query={query}
        initialPage={page}
        filter={filter}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    </div>
  );
}

export default Inventory;
