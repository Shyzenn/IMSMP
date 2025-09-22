import { Table } from "@/components/ui/table";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { getTransactionList } from "@/lib/action/get";
import { formattedDate } from "@/lib/utils";
import TransactionTableHeader from "./TransactionHeader";
import EmptyTable from "../../EmptyTable";
import CashierAction from "../cashier/CashierAction";

const TransactionTable = async ({
  query,
  currentPage,
  filter,
  sortBy = "createdAt",
  sortOrder = "desc",
}: {
  query: string;
  currentPage: number;
  filter: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  const transactions = await getTransactionList(
    query,
    currentPage,
    filter,
    sortBy,
    sortOrder
  );

  return (
    <>
      {transactions.length === 0 ? (
        <EmptyTable content="No Transaction Found" />
      ) : (
        <Table>
          <TransactionTableHeader />
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{`ORD-${transaction.id}`}</TableCell>
                <TableCell>{transaction.customer}</TableCell>
                <TableCell>{formattedDate(transaction.createdAt)}</TableCell>
                <TableCell>{transaction.quantity}</TableCell>
                <TableCell>{`₱${transaction.total}`}</TableCell>
                <TableCell>{transaction.source}</TableCell>
                <TableCell>{transaction.status}</TableCell>
                <TableCell>
                  <CashierAction transaction={transaction} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
};

export default TransactionTable;
