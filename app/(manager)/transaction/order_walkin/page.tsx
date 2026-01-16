import { redirect } from "next/navigation";
import PageTableHeader from "@/app/components/ui/PageTableHeader";
import TransactionClient from "@/app/components/transaction/TransactionClient";

type SearchParams = {
  query: string;
  page: string;
  filter: string;
  sort: string;
  order: string;
  from: string;
  to: string;
};

async function Transaction({
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
  const from = params.from;
  const to = params.to;

  if (!params.filter || !params.page) {
    redirect(
      `/transaction/order_walkin?page=1&filter=all&sort=createdAt&order=desc`
    );
  }

  return (
    <div
      className="p-6 bg-white overflow-auto rounded-md"
      style={{ height: "calc(94vh - 70px)" }}
    >
      <PageTableHeader
        searchPlaceholder="Search customer name..."
        title="History"
        transactionExport={true}
        hasDateFilter={true}
        isTransactionFilter={true}
      />
      <TransactionClient
        query={query}
        initialPage={page}
        filter={filter}
        sortBy={sortBy}
        sortOrder={sortOrder}
        from={from}
        to={to}
      />
    </div>
  );
}

export default Transaction;
