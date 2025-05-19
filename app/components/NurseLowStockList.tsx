import { Column } from "@/lib/interfaces";
import React from "react";
import TableComponent from "./TableComponent";

const lowStocks = [
  {
    Medicine: "Paracetamol",
    StockLeft: "1",
  },
  {
    Medicine: "Amoxicillin",
    StockLeft: "2",
  },
  {
    Medicine: "Vitamin C Tablets",
    StockLeft: "3",
  },
  {
    Medicine: "Aspirin",
    StockLeft: "5",
  },
  {
    Medicine: "Ibuprofen Gel",
    StockLeft: "6",
  },
  {
    Medicine: "Paracetamol",
    StockLeft: "1",
  },
  {
    Medicine: "Amoxicillin",
    StockLeft: "2",
  },
  {
    Medicine: "Vitamin C Tablets",
    StockLeft: "3",
  },
  {
    Medicine: "Aspirin",
    StockLeft: "5",
  },
  {
    Medicine: "Ibuprofen Gel",
    StockLeft: "6",
  },
];

const columns: Column[] = [
  { label: "Medicine", accessor: "Medicine" },
  { label: "Stock Left", accessor: "StockLeft", align: "right" },
];

const NurseLowStockList = () => {
  return (
    <div className="bg-white w-[40%] rounded-md p-3 h-full">
      <p className="text-lg font-semibold mb-1">Low Stock List</p>
      <div className="max-h-[180px] overflow-auto">
        <TableComponent data={lowStocks} columns={columns} />
      </div>
    </div>
  );
};

export default NurseLowStockList;
