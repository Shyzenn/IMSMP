import { Table } from "@/components/ui/table";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { getMTTransactionList } from "@/lib/action/get";
import { formattedDateTime, toTitleCase } from "@/lib/utils";
import EmptyTable from "../../EmptyTable";
import MTTransactionTableHeader from "./MTTransactionHeader";
import MTTransactionAction from "./MTTransactionAction";

const MTTransactionTable = async ({
  query,
  currentPage,
  filter,
  sortBy = "createdAt",
  sortOrder = "desc",
  dateRange,
}: {
  query: string;
  currentPage: number;
  filter: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  dateRange: { from: string; to: string };
}) => {
  const transactions = await getMTTransactionList(
    query,
    currentPage,
    filter,
    sortBy,
    sortOrder,
    dateRange
  );

  return (
    <>
      {transactions.length === 0 ? (
        <EmptyTable content="No Transaction Found" />
      ) : (
        <Table>
          <MTTransactionTableHeader />
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{`REQ-0${transaction.id}`}</TableCell>
                <TableCell>
                  {formattedDateTime(transaction.createdAt)}
                </TableCell>
                <TableCell>
                  {toTitleCase(transaction.requestedBy || "Unknown")}
                </TableCell>
                <TableCell>
                  {toTitleCase(transaction.receivedBy || "Unknown")}
                </TableCell>
                <TableCell>
                  {toTitleCase(transaction.approvedBy || "Unknown")}
                </TableCell>

                <TableCell>{transaction.quantity}</TableCell>
                <TableCell>{toTitleCase(transaction.status)}</TableCell>
                <TableCell>{toTitleCase(transaction.remarks)}</TableCell>
                <TableCell className="w-[120px]" align="right">
                  <MTTransactionAction transaction={transaction} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
};

export default MTTransactionTable;
