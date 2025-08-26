import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React from "react";

const sortableTableHeaders = [
  { key: "id", label: "Log ID" },
  { key: "action", label: "Event" },
  { key: "description", label: "Description" },
  { key: "createdAt", label: "Timestamp" },
  { key: "user", label: "Performed By" },
  { key: "entityType", label: "Target Type" },
  { key: "entityId", label: "Target ID" },
];

const AuditLogTableHeader = () => {
  return (
    <TableHeader>
      <TableRow className="bg-slate-100">
        {sortableTableHeaders.map(({ key, label }) => (
          <TableHead key={key} className="text-black font-semibold">
            {label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
};

export default AuditLogTableHeader;
