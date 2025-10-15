import React from "react";
import TableFilterSelect from "../TableFilterSelect";

const BatchFilter = () => {
  return (
    <TableFilterSelect
      label="select a category"
      staticOptions={[
        { label: "All", value: "all" },
        { label: "Product", value: "Product" },
        { label: "Product Batch", value: "Product Batch" },
      ]}
    />
  );
};

export default BatchFilter;
