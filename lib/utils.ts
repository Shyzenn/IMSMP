import axios from "axios";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Column } from "./interfaces";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalLetter(str: string | null) {
  if (!str) return "";
 return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function formattedDate(dateInput?: string | number | Date) {
  const d = new Date(dateInput ?? Date.now());
  if (isNaN(d.getTime())) return "Invalid Date";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const fetchOrderRequest = async () => {
  const { data } = await axios.get("/api/request_order");
  return Array.isArray(data) ? data : [];
};

export const columns: Column[] = [
  { label: "Order ID", accessor: "id" },
  { label: "Customer Name", accessor: "patient_name" },
  { label: "Date Placed", accessor: "createdAt" },
  { label: "Items", accessor: "items" },
  { label: "Status", accessor: "status", align: "right" },
];
