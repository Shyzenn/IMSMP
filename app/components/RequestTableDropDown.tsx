"use client";

import React, { useState } from "react";
import RecentRequestTable from "@/app/components/RecentRequestTable";
import { RiArrowDropDownLine } from "react-icons/ri";
import RecentMedTechRequestTable from "./RecentMTRequestTable";

const RequestTableDropdown = ({ userRole }: { userRole?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<"order" | "medtech">(
    "order"
  );

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Dropdown Trigger */}
      <div
        className="flex items-center justify-between p-2 border-b cursor-pointer bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold">
          {selectedTable === "order" ? "Order Request" : "MedTech Request"}
        </span>
        <RiArrowDropDownLine
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-10 bg-white border w-48 shadow-md mt-1 rounded-md overflow-hidden">
          <div
            className="p-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              setSelectedTable("order");
              setIsOpen(false);
            }}
          >
            Order Request
          </div>
          <div
            className="p-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              setSelectedTable("medtech");
              setIsOpen(false);
            }}
          >
            MedTech Request
          </div>
        </div>
      )}

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

export default RequestTableDropdown;
