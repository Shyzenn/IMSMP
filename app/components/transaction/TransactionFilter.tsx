"use client";

import React from "react";
import TableFilterSelect from "../TableFilterSelect";

const TransactionFilter = () => {
  return (
    <TableFilterSelect
      staticOptions={[
        { label: "Regular", value: "regular" },
        { label: "Pay Later", value: "emergency" },
        { label: "Pending", value: "pending" },
        { label: "For Payment", value: "for_payment" },
        { label: "Paid", value: "paid" },
        { label: "Cancelled", value: "canceled" },
        { label: "Refunded", value: "refunded" },
      ]}
    />
  );
};

export default TransactionFilter;
