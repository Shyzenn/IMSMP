import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { toTitleCase } from "@/lib/utils";
import EmptyTable from "../../ui/EmptyTable";
import BatchesTableHeader from "./BatchesTableHeader";
import BatchAction from "./BatchAction";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { ProductSkeleton } from "../../ui/Skeleton";

export type BatchProps = {
  id: number;
  product: {
    productId: number;
    product_name: string;
    category: { id: number; name: string } | null;
    genericName: string | null;
    dosageForm: string | null;
    strength: string | null;
    price: number;
  };
  totalQuantity: number;
  batchNumber: string;
  quantity: number;
  manufactureDate: Date;
  expiryDate: Date;
  status: string;
  notes: string;
};

// Format date without timezone conversion
const formatDateLocal = (date: Date) => {
  return format(new Date(date), "dd/MM/yyyy");
};

export default function BatchTable({
  batches,
  isLoading,
}: {
  batches: BatchProps[];
  isLoading: boolean;
}) {
  const { data: session } = useSession();
  const userRole = session?.user.role;

  return (
    <>
      {batches.length === 0 ? (
        <EmptyTable content="No Batches Found" />
      ) : (
        <Table>
          <BatchesTableHeader />
          <TableBody>
            {isLoading ? (
              <ProductSkeleton />
            ) : (
              <>
                {batches
                  .filter((batch) => batch.status !== "ARCHIVED")
                  .map((batch, i) => (
                    <TableRow
                      key={i}
                      className={`${
                        batch.status === "Expiring"
                          ? "bg-yellow-50"
                          : batch.status === "Expired"
                          ? "bg-red-50"
                          : batch.status === "Consumed"
                          ? "bg-slate-100"
                          : ""
                      }`}
                    >
                      <TableCell>{`PRD-BCH-0${batch.id}`}</TableCell>
                      <TableCell>
                        {toTitleCase(batch.product.product_name)}
                      </TableCell>
                      <TableCell>{batch.batchNumber}</TableCell>
                      <TableCell>{batch.quantity}</TableCell>
                      <TableCell>
                        {formatDateLocal(batch.manufactureDate)}
                      </TableCell>
                      <TableCell>{formatDateLocal(batch.expiryDate)}</TableCell>
                      <TableCell>{batch.status}</TableCell>
                      {(userRole === "Manager" ||
                        userRole === "Pharmacist_Staff") && (
                        <TableCell>
                          <BatchAction batch={batch} />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
              </>
            )}
          </TableBody>
        </Table>
      )}
    </>
  );
}
