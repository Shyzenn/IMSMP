import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableComponentProps } from "@/lib/interfaces";
import { useSession } from "next-auth/react";

function TableComponent<T extends Record<string, unknown>>({
  columns,
  data,
  setIsOrderModalOpen,
  onRowClick,
  title,
  requestOrderBtn,
  interactiveRows,
  noDataMessage,
  colorCodeExpiry = false,
}: TableComponentProps<T>) {
  const { data: session } = useSession();
  const userRole = session?.user.role;

  return (
    <>
      <div
        className={`flex ${
          requestOrderBtn ? "justify-between py-4" : "justify-start py-2"
        } items-center sticky top-0 bg-white z-10`}
      >
        {requestOrderBtn ? (
          <>
            <p className="text-lg font-semibold">{title}</p>
            <div>{requestOrderBtn}</div>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold">{title}</p>
          </>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.accessor}
                className={
                  column.align === "right" ? "text-right" : "text-left"
                }
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center py-4 text-gray-500"
              >
                {noDataMessage || "No Data Available"}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, i) => {
              const expiry = new Date(row.expiryDate as string);
              const today = new Date();
              const diffInDays = Math.ceil(
                (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
              );

              let rowColor = "";
              if (diffInDays <= 7) {
                rowColor = "bg-red-50";
              } else if (diffInDays <= 14) {
                rowColor = "bg-orange-50";
              } else if (diffInDays <= 21) {
                rowColor = "bg-yellow-50";
              }

              return (
                <TableRow key={i} className={colorCodeExpiry ? rowColor : ""}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.accessor}
                      className={`${
                        column.align === "right" ? "text-right" : "text-left"
                      } ${
                        interactiveRows && userRole !== "Cashier"
                          ? "cursor-pointer"
                          : ""
                      }`}
                      onClick={() => {
                        if (userRole === "Cashier") {
                          onRowClick?.(row);
                        } else {
                          onRowClick?.(row);
                          setIsOrderModalOpen?.(true);
                        }
                      }}
                    >
                      {column.render
                        ? column.render(row)
                        : String(row[column.accessor])}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </>
  );
}

export default TableComponent;
