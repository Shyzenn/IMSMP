import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { capitalLetter, formattedDate } from "@/lib/utils";
import EmptyTable from "../../EmptyTable";
import { getBatches } from "@/lib/action/get";
import BatchesTableHeader from "./BatchesTableHeader";
import BatchAction from "./BatchAction";
import { auth } from "@/auth";

export type BatchProps = {
  id: number;
  product: { product_name: string };
  batchNumber: number;
  quantity: number;
  releaseDate: Date;
  expiryDate: Date;
  status: string;
};

export default async function BatchTable({
  query = "",
  currentPage = 1,
  filter = "all",
  sortBy = "createdAt",
  sortOrder = "desc",
}: {
  query?: string;
  currentPage?: number;
  filter?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const session = await auth();
  const userRole = session?.user.role;

  const batches: BatchProps[] = await getBatches(
    query,
    currentPage,
    filter,
    sortBy,
    sortOrder
  );

  return (
    <>
      {batches.length === 0 ? (
        <EmptyTable content="No Batches Found" />
      ) : (
        <Table>
          <BatchesTableHeader />
          <TableBody>
            {batches.map((batch, i) => (
              <TableRow
                key={i}
                className={`${
                  batch.status === "Expiring"
                    ? "bg-yellow-50"
                    : batch.status === "Expired"
                    ? "bg-red-50"
                    : ""
                }`}
              >
                <TableCell>{batch.id}</TableCell>
                <TableCell>
                  {capitalLetter(batch.product.product_name)}
                </TableCell>
                <TableCell>{batch.batchNumber}</TableCell>
                <TableCell>{batch.quantity}</TableCell>
                <TableCell>{formattedDate(batch.releaseDate)}</TableCell>
                <TableCell>{formattedDate(batch.expiryDate)}</TableCell>
                <TableCell>{batch.status}</TableCell>
                {(userRole === "Manager" ||
                  userRole === "Pharmacist_Staff") && (
                  <TableCell>
                    <BatchAction batch={batch} />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
