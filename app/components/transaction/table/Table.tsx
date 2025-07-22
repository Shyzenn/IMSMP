import { Table } from "@/components/ui/table";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { getTransactionList } from "@/lib/action/get";
import { formattedDate } from "@/lib/utils";
import TransactionTableHeader from "./TransactionHeader";

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
    <Table>
      <TransactionTableHeader />
      <TableBody>
        {transactions.map((transaction, i) => (
          <TableRow key={i}>
            <TableCell>{transaction.customer}</TableCell>
            <TableCell>{formattedDate(transaction.createdAt)}</TableCell>

            <TableCell>{transaction.quantity}</TableCell>
            <TableCell>{`₱${transaction.total}`}</TableCell>
            <TableCell>{transaction.source}</TableCell>
            <TableCell>{transaction.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TransactionTable;
