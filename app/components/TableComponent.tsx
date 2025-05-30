import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableComponentProps } from "@/lib/interfaces";

function TableComponent<T extends Record<string, unknown>>({
  columns,
  data,
  setIsOrderModalOpen,
  onRowClick,
  title,
  requestOrderBtn,
  interactiveRows,
}: TableComponentProps<T>) {
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
          {data.map((row, i) => (
            <TableRow key={i}>
              {columns.map((column) => (
                <TableCell
                  key={column.accessor}
                  className={`${
                    column.align === "right" ? "text-right" : "text-left"
                  } ${interactiveRows ? "cursor-pointer" : ""}`}
                  onClick={() => {
                    setIsOrderModalOpen?.(true);
                    onRowClick?.(row);
                  }}
                >
                  {String(row[column.accessor])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

export default TableComponent;
