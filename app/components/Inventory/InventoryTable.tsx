import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { capitalLetter, formattedDate } from "@/lib/utils";
import { IconType } from "react-icons/lib";
import EmptyTable from "../EmptyTable";
import { getProductList } from "@/lib/action/get";
import Action from "./InventoryAction";
import InventoryTableHeader from "./InventoryTableHeader";

export interface ProductProps {
  id: string | number;
  product_name: string;
  category: string;
  quantity: number;
  price: number;
  releaseDate: Date | null;
  expiryDate: Date | null;
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
        <EmptyTable content="No Product Available" />
      ) : (
        <Table>
          <InventoryTableHeader />
          <TableBody>
            {products.map((product, i) => (
              <TableRow
                key={i}
                className={`${product.quantity === 0 ? "bg-red-50" : ""} ${
                  product.quantity <= 6 && product.quantity !== 0
                    ? "bg-orange-50"
                    : ""
                }`}
              >
                <TableCell>{capitalLetter(product.product_name)}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>{`₱${product.price}`}</TableCell>
                <TableCell>{formattedDate(product.releaseDate)}</TableCell>
                <TableCell>{formattedDate(product.expiryDate)}</TableCell>
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
