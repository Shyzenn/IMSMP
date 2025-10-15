import React from "react";
import ReusableTableHeader from "../../ReusabaleTableHeader";

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
  return <ReusableTableHeader headers={sortableTableHeaders} />;
};

export default AuditLogTableHeader;
