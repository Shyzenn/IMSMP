import React from "react";
import TableFilterSelect from "../TableFilterSelect";

const BatchFilter = () => {
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

export default BatchFilter;
