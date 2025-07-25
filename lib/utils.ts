import { Status } from "@prisma/client";
import { clsx, type ClassValue } from "clsx"
import { formatDistanceToNow } from "date-fns";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalLetter(str: string | null) {
  if (!str) return "";
 return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function formattedDate(dateInput?: string | number | Date | null) {
  const d = new Date(dateInput ?? Date.now());
  if (isNaN(d.getTime())) return "Invalid Date";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const relativeTime = (date: string | Date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const ITEMS_PER_PAGE = 14;

export default function formatStatus(rawStatus: string) {
  const statusMap: Record<string, string> = {
    pending: "Pending",
    for_payment: "For Payment",
    paid: "Paid",
  };

  return statusMap[rawStatus] || capitalLetter(rawStatus);
}

export type TransactionFilter =
  | "all"
  | "walk_in"
  | "request_order"
  | "paid"
  | "pending"
  | "for_payment";

export const isWalkInFilterEnabled = (filter: TransactionFilter) => {
  return filter === "all" || filter === "paid" || filter === "walk_in";
};

export const isRequestOrderFilterEnabled = (filter: TransactionFilter) => {
  return (
    filter === "all" ||
    filter === "paid" ||
    filter === "pending" ||
    filter === "for_payment" ||
    filter === "request_order"
  );
};

export const mapStatus = (filter: TransactionFilter): Status | undefined => {
  if (filter === "paid") return Status.paid;
  if (filter === "pending") return Status.pending;
  if (filter === "for_payment") return Status.for_payment;
  return undefined;
};

export const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/inventory": "Inventory",
    "/transaction": "Transaction",
    "/add-product": "Add New Product",
    "/order": "Order",
    "/settings": "Settings",
    "/request-order": "Request Order",
  };

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};

export const isActive = (pathname: string, href: string) => {
  return pathname === href || pathname.startsWith(href);
};

