import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { capitalLetter, formattedDate } from "@/lib/utils";
import { IconType } from "react-icons/lib";
import EmptyTable from "../../EmptyTable";
import { getProductList } from "@/lib/action/get";
import Action from "./InventoryAction";
import InventoryTableHeader from "./InventoryTableHeader";
import { FaExclamation } from "react-icons/fa6";

export interface ProductProps {
  id: number;
  product_name: string;
  category: string;
  totalQuantity: number;
  price: number;
  expiringSoonCount: number;
  totalBatches: number;
  createdAt: Date;
  icon?: IconType[];
}

export default async function InventoryTable({
  query = "",
  currentPage = 1,
  filter = "latest",
  sortBy = "createdAt",
  sortOrder = "desc",
}: {
  query?: string;
  currentPage?: number;
  filter?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const products: ProductProps[] = await getProductList(
    query,
    currentPage,
    filter,
    sortBy,
    sortOrder
  );

  return (
    <>
      {products.length === 0 ? (
        <EmptyTable content="No Product Found" />
      ) : (
        <Table>
          <InventoryTableHeader />
          <TableBody>
            {products.map((product, i) => (
              <TableRow
                key={i}
                className={`${product.totalQuantity === 0 ? "bg-red-50" : ""} ${
                  product.totalQuantity <= 6 && product.totalQuantity !== 0
                    ? "bg-orange-50"
                    : ""
                }`}
              >
                <TableCell>{`PRD-0${product.id}`}</TableCell>
                <TableCell>{capitalLetter(product.product_name)}</TableCell>
                <TableCell>{product.totalQuantity}</TableCell>
                <TableCell>{`₱${product.price}`}</TableCell>
                <TableCell>{formattedDate(product.createdAt)}</TableCell>
                <TableCell>
                  {product.expiringSoonCount > 0 ? (
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
                <TableCell>{capitalLetter(product.category)}</TableCell>
                <TableCell>
                  <Action product={product} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
