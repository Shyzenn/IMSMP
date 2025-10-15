import React from "react";
import TableFilterSelect from "../TableFilterSelect";

const AuditFilter = () => {
  return (
    <TableFilterSelect
      label="select a category"
      staticOptions={[
        { label: "All", value: "all" },
        { label: "Change Password", value: "ChangePassword" },
        { label: "Order Request", value: "OrderRequest" },
        { label: "Product", value: "Product" },
        { label: "Session", value: "Session" },
        { label: "Walkin Order", value: "WalkInOrder" },
      ]}
    />
  );
};

export default AuditFilter;
