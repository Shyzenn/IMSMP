import { Table } from "@/components/ui/table";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { getTransactionList } from "@/lib/action/get";
import { formattedDateTime, statusLabels } from "@/lib/utils";
import TransactionTableHeader from "./TransactionHeader";
import EmptyTable from "../../EmptyTable";
import TransactionAction from "./TransactionAction";

const TransactionTable = async ({
  query,
  currentPage,
  filter,
  sortBy = "createdAt",
  sortOrder = "desc",
  userRole,
  dateRange,
}: {
  query: string;
  currentPage: number;
  filter: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  userRole: string;
  dateRange: { from: string; to: string };
}) => {
  const transactions = await getTransactionList(
    query,
    currentPage,
    filter,
    sortBy,
    sortOrder,
    userRole,
    dateRange
  );

  return (
    <>
      {transactions.length === 0 ? (
        <EmptyTable content="No Transaction Found" />
      ) : (
        <Table>
          <TransactionTableHeader userRole={userRole} />
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={`${transaction.source}-${transaction.id}`}>
                <TableCell>{`ORD-0${transaction.id}`}</TableCell>
                <TableCell>{transaction.customer}</TableCell>
                <TableCell>
                  {formattedDateTime(transaction.createdAt)}
                </TableCell>
                <TableCell>{transaction.quantity}</TableCell>
                <TableCell>{`₱${transaction.total}`}</TableCell>
                <TableCell>{transaction.source}</TableCell>
                <TableCell>
                  {transaction.type === "REGULAR"
                    ? "Regular"
                    : transaction.type === "EMERGENCY"
                    ? "Pay Later"
                    : "N/A"}
                </TableCell>
                <TableCell>{statusLabels[transaction.status]}</TableCell>
                <TableCell className="w-[120px]" align="right">
                  <TransactionAction transaction={transaction} />
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
