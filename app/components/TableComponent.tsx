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
  largeContainer,
  columns,
  data,
  onRowClick,
  title,
  interactiveRows,
  noDataMessage,
  colorCodeExpiry = false,
  filter,
}: TableComponentProps<T>) {
  const { data: session } = useSession();
  const userRole = session?.user.role;

  const reusableTalbe = () => (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column.accessor}
              className={column.align === "right" ? "text-right" : "text-left"}
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
                      interactiveRows && userRole !== "Manager"
                        ? ""
                        : "cursor-pointer"
                    }`}
                    onClick={() => {
                      if (userRole === "Manager") {
                        onRowClick?.(row);
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
  );

  return (
    <>
      <div className="flex items-center justify-between p-2">
        <p className="text-lg font-semibold">{title}</p>
        {filter && <div>{filter}</div>}
      </div>
      {largeContainer ? (
        <div className="overflow-x-auto md:max-w-full">
          <div
            className={` ${
              userRole === "Cashier" || userRole === "Nurse"
                ? "min-w-[800px]"
                : "min-w-[700px]"
            } ${userRole === "Pharmacist_Staff" ? "min-w-[950px]" : ""}`}
          >
            {reusableTalbe()}
          </div>
        </div>
      ) : (
        reusableTalbe()
      )}
    </>
  );
}

export default TableComponent;
