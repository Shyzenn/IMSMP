import { Table } from "@/components/ui/table";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { getAuditLogList } from "@/lib/action/get";
import { formattedDateTime, toTitleCase } from "@/lib/utils";

import EmptyTable from "../../EmptyTable";
import AuditLogTableHeader from "./Header";

export default async function AuditLogTable({
  query = "",
  filter = "all",
  currentPage = 1,
  dateRange,
}: {
  query?: string;
  filter?: string;
  currentPage?: number;
  dateRange: { from: string; to: string };
}) {
  const auditLogs = await getAuditLogList(
    query,
    filter,
    currentPage,
    dateRange
  );

  return (
    <>
      {auditLogs.length === 0 ? (
        <EmptyTable content="No Audit Log Found" />
      ) : (
        <Table>
          <AuditLogTableHeader />
          <TableBody>
            {auditLogs.map((auditLog, i) => (
              <TableRow key={i}>
                <TableCell>{`ORD-0${auditLog.id}`}</TableCell>
                <TableCell>{auditLog.action}</TableCell>
                <TableCell>{auditLog.description}</TableCell>
                <TableCell>{formattedDateTime(auditLog.createdAt)}</TableCell>
                <TableCell>
                  {toTitleCase(auditLog.user?.username) ?? "-"}
                </TableCell>
                <TableCell>{auditLog.entityType}</TableCell>
                <TableCell>
                  {auditLog.entityId === null ? "-" : auditLog.entityId}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
