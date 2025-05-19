import React from "react";
import Button from "@/app/components/Button";
import TableComponent from "./TableComponent";
import { Column } from "@/lib/interfaces";

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    items: "2",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    items: "2",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    items: "2",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    items: "2",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    items: "2",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    items: "2",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    items: "2",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
];

const columns: Column[] = [
  { label: "Order ID", accessor: "invoice" },
  { label: "Customer Name", accessor: "paymentStatus" },
  { label: "Date Placed", accessor: "paymentMethod" },
  { label: "Items", accessor: "items" },
  { label: "Status", accessor: "totalAmount", align: "right" },
];

const RecentRequestOrder = () => {
  return (
    <>
      <div className="flex justify-between p-5">
        <p className="text-lg font-semibold">Recent Request Order</p>
        <Button label="Request Order" />
      </div>

      <div className="mx-4 max-h-[220px] overflow-auto">
        <TableComponent data={invoices} columns={columns} />
      </div>
    </>
  );
};

export default RecentRequestOrder;
