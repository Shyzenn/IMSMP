import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { formattedDate, formattedDateTime, toTitleCase } from "@/lib/utils";
import { getArchive } from "@/lib/action/get";
import ArchiveTableHeader from "./ArchiveTableHeader";
import { auth } from "@/auth";
import EmptyTable from "../ui/EmptyTable";
import ArchiveAction from "./ArchiveAction";

export default async function ArchiveTable({
  query = "",
  currentPage = 1,
  filter = "all",
}: {
  query?: string;
  currentPage?: number;
  filter?: string;
}) {
  const session = await auth();
  const userRole = session?.user.role;

  const archive = await getArchive(query, currentPage, filter);

  return (
    <>
      {archive.length === 0 ? (
        <EmptyTable content="No Archive Found" />
      ) : (
        <Table>
          <ArchiveTableHeader />
          <TableBody>
            {archive.map((item, i) => (
              <TableRow key={`${item.type}-${item.id}`} className="bg-gray-100">
                <TableCell>{i + 1}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.type === "Product"
                        ? "bg-blue-100 text-blue-800"
                        : item.type === "Product Batch"
                        ? "bg-green-100 text-green-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {item.type}
                  </span>
                </TableCell>
                <TableCell>{toTitleCase(item.product_name)}</TableCell>

                <TableCell>
                  {item.type === "Product"
                    ? item.category || "None"
                    : item.type === "Product Batch"
                    ? `Batch ${item.batchNumber}`
                    : item.category || "None"}
                </TableCell>

                <TableCell>{item.quantity}</TableCell>

                <TableCell>
                  {item.type === "Product Batch" && item.releaseDate
                    ? formattedDate(item.releaseDate)
                    : "None"}
                </TableCell>

                <TableCell>
                  {item.type === "Product Batch" && item.expiryDate
                    ? formattedDate(item.expiryDate)
                    : "None"}
                </TableCell>
                <TableCell>
                  {item.archiveReason
                    ? item.archiveReason
                    : "No reason provided"}
                </TableCell>

                <TableCell>{formattedDateTime(item.archivedAt)}</TableCell>

                <TableCell>{toTitleCase(item.archivedBy)}</TableCell>

                <TableCell>
                  {userRole === "Manager" ||
                  userRole === "Pharmacist_Staff" ||
                  (userRole === "Nurse" && item.type === "Order Request") ? (
                    <span className="text-gray-400 text-sm">
                      <ArchiveAction item={item} />
                    </span>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
