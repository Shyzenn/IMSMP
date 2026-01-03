"use client";

import React from "react";
import TableFilterSelect from "../ui/TableFilterSelect";

const MTTransactionFilter = () => {
  return (
    <TableFilterSelect
      staticOptions={[
        { label: "Pending for Approval", value: "pending_for_approval" },
        { label: "Approved", value: "approved" },
        { label: "Declined", value: "declined" },
        { label: "Processing", value: "processing" },
        { label: "Ready for Pickup", value: "ready" },
        { label: "Released", value: "released" },
      ]}
    />
  );
};

export default MTTransactionFilter;
