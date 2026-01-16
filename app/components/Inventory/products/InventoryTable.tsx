import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { formatPackageType, formattedDateTime, toTitleCase } from "@/lib/utils";
import { IconType } from "react-icons/lib";
import EmptyTable from "../../ui/EmptyTable";
import Action from "./InventoryAction";
import InventoryTableHeader from "./InventoryTableHeader";
import { FaExclamation } from "react-icons/fa6";
import { useSession } from "next-auth/react";

export interface ProductProps {
  id: number;
  product_name: string;
  genericName: string | null;
  manufacturer: string | null;
  description: string | null;
  requiresPrescription: boolean;
  strength: string | null;
  dosageForm: string | null;
  category: string;
  totalQuantity: number;
  price: number;
  minimumStockAlert: number;
  expiringSoonCount: number;
  totalBatches: number;
  createdAt: Date;
  icon?: IconType[];
  batchQuantity: number[];
  status: "ACTIVE" | "ARCHIVED" | "EXPIRING";
  archiveReason: string | null;
}

export default function InventoryTable({
  products,
  isLoading,
}: {
  products: ProductProps[];
  isLoading: boolean;
}) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const hasAction = userRole === "Manager" || userRole === "Pharmacist_Staff";

  if (isLoading) {
    return <div className="p-4">Loading products...</div>;
  }

  return (
    <>
      {products.length === 0 ? (
        <EmptyTable content="No Product Found" />
      ) : (
        <Table>
          <InventoryTableHeader hasAction={hasAction} />
          <TableBody>
            {products
              .filter((products) => products.status !== "ARCHIVED")
              .map((product, i) => (
                <TableRow
                  key={i}
                  className={`${
                    product.totalQuantity === 0 ? "bg-red-50" : ""
                  } ${
                    product.totalQuantity <= 6 && product.totalQuantity !== 0
                      ? "bg-orange-50"
                      : ""
                  }`}
                >
                  <TableCell>{`PRD-0${product.id}`}</TableCell>
                  <TableCell>{toTitleCase(product.product_name)}</TableCell>
                  <TableCell>{product.strength}</TableCell>
                  <TableCell>
                    {product.dosageForm
                      ? formatPackageType(product.dosageForm)
                      : "N/A"}
                  </TableCell>
                  <TableCell>{product.totalQuantity}</TableCell>
                  <TableCell>{`₱${Number(product.price).toFixed(
                    2
                  )}`}</TableCell>

                  <TableCell>{formattedDateTime(product.createdAt)}</TableCell>
                  <TableCell>
                    {product.expiringSoonCount > 0 &&
                    product.batchQuantity[0] > 0 ? (
                      <span className="flex items-center">
                        {product.expiringSoonCount}{" "}
                        {`batch${product.expiringSoonCount > 1 ? "es" : ""}`}
                        <span className="text-red-500 font-bold animate-pulse">
                          <FaExclamation className="text-xl" />
                        </span>
                      </span>
                    ) : (
                      "0"
                    )}
                  </TableCell>
                  <TableCell>{product.totalBatches}</TableCell>
                  <TableCell>{toTitleCase(product.category)}</TableCell>
                  {hasAction && (
                    <TableCell>
                      <Action product={product} />
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
