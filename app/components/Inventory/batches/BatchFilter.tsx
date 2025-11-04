import React from "react";
import TableFilterSelect from "../../TableFilterSelect";

const BatchFilter = () => {
  return (
    <TableFilterSelect
      staticOptions={[
        { label: "All", value: "all" },
        { label: "Active", value: "Active" },
        { label: "Expiring", value: "Expiring" },
        { label: "Expired", value: "Expired" },
        { label: "Consumed", value: "Consumed" },
      ]}
    />
  );
};

export default BatchFilter;
