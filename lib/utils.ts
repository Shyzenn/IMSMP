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

export const columns: Column[] = [
  { label: "Order ID", accessor: "id" },
  { label: "Customer Name", accessor: "patient_name" },
  { label: "Date Placed", accessor: "createdAt" },
  { label: "Items", accessor: "items" },
  { label: "Status", accessor: "status", align: "right" },
];

export const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/inventory": "Inventory",
    "/transaction": "Transaction",
    "/add-product": "Add New Product",
    "/order": "Order",
    "/settings": "Settings",
    "/request-order": "Request Order",
  };