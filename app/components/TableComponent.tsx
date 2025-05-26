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
}: TableComponentProps<T>) {
  return (
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
        {data.map((row, i) => (
          <TableRow key={i}>
            {columns.map((column) => (
              <TableCell
                key={column.accessor}
                className={`${
                  column.align === "right" ? "text-right" : "text-left"
                } cursor-pointer`}
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
  );
}

export default TableComponent;
