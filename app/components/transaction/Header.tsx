"use client";

import Search from "../ui/Search";
import TransactionFilter from "./TransactionFilter";
import { DateRangeFilter } from "../ui/DateRangeFilter";
import { useRouter, useSearchParams } from "next/navigation";

const TransactionHeader = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDateChange = (range: { from?: Date; to?: Date }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (range.from) params.set("from", range.from.toISOString());
    if (range.to) params.set("to", range.to.toISOString());
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex justify-between items-center gap-4">
      <p className="text-2xl font-semibold">History</p>

      <div className="flex items-center gap-3">
        <div className="w-[20rem] border px-6 rounded-full flex items-center gap-2 bg-gray-50">
          <Search placeholder="Search..." />
        </div>
        <TransactionFilter />
        <DateRangeFilter onChange={handleDateChange} />{" "}
      </div>
    </div>
  );
};

export default TransactionHeader;
