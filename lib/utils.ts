import { OrderType, Status } from "@prisma/client";
import { clsx, type ClassValue } from "clsx"
import { endOfDay, formatDistanceToNow, parseISO, startOfDay } from "date-fns";
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

export function formattedDateTime(
  dateInput?: string | number | Date | null,
  timeZone = "Asia/Manila"
) {
  const d = new Date(dateInput ?? Date.now());
  if (isNaN(d.getTime())) return "Invalid Date";

  return d.toLocaleString("en-PH", {
    timeZone,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export const relativeTime = (date: string | Date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const ITEMS_PER_PAGE = 25;

export default function formatStatus(rawStatus: string) {
  const statusMap: Record<string, string> = {
    pending: "Pending",
    for_payment: "For Payment",
    paid: "Paid",
  };

  return statusMap[rawStatus] || capitalLetter(rawStatus);
}

export function expiryDate(expiryDate: string) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export const statusLabels: Record<string, string> = {
  for_payment: "For Payment",
  canceled: "Cancelled",
  paid: "Paid",
  pending: "Pending",
};

export const typeLabels = {
  REGULAR: "Regular",
  EMERGENCY: "Emergency",
};

export type   TransactionFilter =
  | "all"
  | "regular"
  | "emergency"
  | "walk_in"
  | "request_order"
  | "paid"
  | "pending"
  | "for_payment"
  | "canceled";

export const isWalkInFilterEnabled = (filter: TransactionFilter) => {
  return filter === "all" || filter === "paid" || filter === "walk_in";
};

export const isRequestOrderFilterEnabled = (filter: TransactionFilter) => {
  return (
    filter === "all" ||
    filter === "regular" ||
    filter === "emergency" ||
    filter === "paid" ||
    filter === "pending" ||
    filter === "for_payment" ||
    filter === "request_order" ||
    filter === "canceled"
  );
};

export const mapStatus = (filter: TransactionFilter) => {
  switch (filter) {
    case "regular":
      return { field: "type", value: OrderType.REGULAR };
    case "emergency":
      return { field: "type", value: OrderType.EMERGENCY };
    case "paid":
      return { field: "status", value: Status.paid };
    case "pending":
      return { field: "status", value: Status.pending };
    case "for_payment":
      return { field: "status", value: Status.for_payment };
    case "canceled":
      return { field: "status", value: Status.canceled };
    default:
      return undefined;
  }
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

export const inventorySkeletonHeaders = [
  { key: "product_name", label: "Product" },
  { key: "quantity", label: "Quantity" },
  { key: "price", label: "Price" },
  { key: "releaseDate", label: "Release Date" },
  { key: "expiryDate", label: "Expiry Date" },
  { key: "category", label: "Category" },
  { key: "Action", label: "Actions" },
];

export const transactionSkeletonHeaders = [
  { key: "customer_name", label: "Customer Name" },
  { key: "createdAt", label: "Created At" },
  { key: "quantity", label: "Quantity" },
  { key: "total", label: "Total Price" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
];

export const dateFilter = (dateRange:{to: string, from: string}) => {
    let startDate: Date | undefined;
    let endDate: Date | undefined;
  
    if (dateRange?.from) {
      startDate = startOfDay(parseISO(dateRange.from));
    }
    if (dateRange?.to) {
      endDate = endOfDay(parseISO(dateRange.to));
    }
  
     const dateFilter =
      startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : undefined;

    return dateFilter
}