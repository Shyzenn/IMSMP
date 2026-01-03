"use client";

import React, { useState } from "react";
import RecentRequestTable from "@/app/components/request_order/RecentRequestTable";
import RecentMedTechRequestTable from "../medtech/RecentMTRequestTable";

const RequestTableTab = ({ userRole }: { userRole?: string }) => {
  const [selectedTable, setSelectedTable] = useState<"order" | "medtech">(
    "order"
  );

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Dropdown Trigger */}
      <div className="flex items-center py-1 border-b text-sm text-gray-600 gap-1">
        <button
          className={`border-r w-[10rem] py-1.5 rounded-md cursor-default transition-all duration-200  ${
            selectedTable === "order"
              ? "bg-gray-100 shadow-inner text-gray-900"
              : "hover:bg-gray-100"
          }`}
          onClick={() => setSelectedTable("order")}
        >
          <p>Order Request</p>
        </button>
        <button
          className={`border-r w-[10rem] py-1.5 rounded-md cursor-default transition-all duration-200  ${
            selectedTable === "medtech"
              ? "bg-gray-100 shadow-inner text-gray-900 "
              : "hover:bg-gray-100"
          }`}
          onClick={() => setSelectedTable("medtech")}
        >
          <p>MedTech Request</p>
        </button>
      </div>

      {/* Render Table */}
      <div className="flex-1 overflow-auto">
        {selectedTable === "order" ? (
          <RecentRequestTable userRole={userRole} />
        ) : (
          <RecentMedTechRequestTable userRole={userRole} />
        )}
      </div>
    </div>
  );
};

export default RequestTableTab;
