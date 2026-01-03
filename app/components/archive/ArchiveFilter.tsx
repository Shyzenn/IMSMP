import React from "react";
import TableFilterSelect from "../ui/TableFilterSelect";

const ArchiveFilter = () => {
  return (
    <TableFilterSelect
      staticOptions={[
        { label: "All", value: "all" },
        { label: "Product", value: "Product" },
        { label: "Product Batch", value: "Product Batch" },
        { label: "Order Request", value: "Order Request" },
      ]}
    />
  );
};

export default ArchiveFilter;
