import React from "react";
import Search from "../Search";
import TransactionFilter from "./TransactionFilter";

const TransactionHeader = () => {
  return (
    <div className="flex justify-between">
      <p className="text-2xl font-semibold">History</p>
      <div className="w-[30rem] border px-6 rounded-full flex items-center gap-2 bg-gray-50">
        <Search placeholder="Search..." />
      </div>
      <TransactionFilter />
    </div>
  );
};

export default TransactionHeader;
