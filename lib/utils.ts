import {
  MedTechRemarks,
  MedTechStatus,
  OrderType,
  Status,
} from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { endOfDay, formatDistanceToNow, parseISO, startOfDay } from "date-fns";
import { twMerge } from "tailwind-merge";

export function DiscountTypeFormat(type: string | undefined) {
  switch (type) {
    case "PWD":
      return "PWD";
    case "SENIOR":
      return "Senior";
    case "CUSTOM":
      return "Custom";
    case "NONE":
      return "None";
    default:
      return type;
  }
}

export function getInitials(fullName: string) {
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function stringToDarkColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 40%, 45%)`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPackageType = (type: string) => {
  if (!type) return "";

  switch (type.toLowerCase()) {
    case "iv_bag":
      return "IV Bag";
    case "iv_solution":
      return "IV Solution";
    case "g":
      return "Gram";
    case "ml":
      return "mL";
    default:
      // Replace underscores with spaces and capitalize each word
      return type
        .replace(/_/g, " ")
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
  }
};

export const unitsMeasuredByAmount: string[] = [
  "ml",
  "gram",
  "mg",
  "liter",
  "piece",
];

export function toTitleCase(name: string) {
  if (!name) return "";

  return name
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function capitalLetter(str: string | null) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formattedDate(dateInput?: string | number | Date | null) {
  const d = new Date(dateInput ?? Date.now());
  if (isNaN(d.getTime())) return "Invalid Date";
  return d.toLocaleDateString("en-PH", {
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
  refunded: "Refunded",
};

// export const typeLabels = {
//   REGULAR: "Regular",
//   EMERGENCY: "Pay Later",
// };

export type MTTransactionFilter =
  | "all"
  | "pending_for_approval"
  | "approved"
  | "declined"
  | "processing"
  | "ready"
  | "released";

export const isMTFilterEnabled = (filters: MTTransactionFilter[]) => {
  return filters.some(
    (f) =>
      f === "all" ||
      f === "pending_for_approval" ||
      f === "approved" ||
      f === "declined" ||
      f === "processing" ||
      f === "ready" ||
      f === "released"
  );
};

export const mapMTStatus = (filter: MTTransactionFilter) => {
  switch (filter) {
    case "pending_for_approval":
      return { field: "status", value: MedTechStatus.pending_for_approval };
    case "approved":
      return { field: "status", value: MedTechStatus.approved };
    case "declined":
      return { field: "status", value: MedTechStatus.declined };
    case "processing":
      return { field: "remarks", value: MedTechRemarks.processing };
    case "ready":
      return { field: "remarks", value: MedTechRemarks.ready };
    case "released":
      return { field: "remarks", value: MedTechRemarks.released };
    default:
      return undefined;
  }
};

export type TransactionFilter =
  | "all"
  | "regular"
  | "emergency"
  | "walk_in"
  | "request_order"
  | "paid"
  | "pending"
  | "for_payment"
  | "canceled"
  | "refunded";

export const isWalkInFilterEnabled = (filters: TransactionFilter[]) => {
  return filters.some(
    (f) => f === "all" || f === "paid" || f === "walk_in" || f === "refunded"
  );
};

export const isRequestOrderFilterEnabled = (filters: TransactionFilter[]) => {
  return filters.some(
    (f) =>
      f === "all" ||
      f === "regular" ||
      f === "emergency" ||
      f === "paid" ||
      f === "pending" ||
      f === "for_payment" ||
      f === "request_order" ||
      f === "canceled" ||
      f === "refunded"
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
    case "refunded":
      return { field: "status", value: Status.refunded };
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

export const archiveSkeletonHeaders = [
  { key: "no.", label: "No." },
  { key: "product", label: "Product" },
  { key: "Category/Batch/Room", label: "Category / Batch / Room" },
  { key: "quantity", label: "Quantity" },
  { key: "releaseDate", label: "Release Date" },
  { key: "expiryDate", label: "Expiry Date" },
  { key: "archiveAt", label: "Archived At" },
  { key: "action", label: "Actions	" },
];

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

export const transactionMTSkeletonHeaders = [
  { key: "number", label: "No." },
  { key: "createdAt", label: "Created At" },
  { key: "requestedBy", label: "Requested By" },
  { key: "receivedBy", label: "Received By" },
  { key: "approvedBy", label: "Approved By" },
  { key: "quantity", label: "Quantity" },
  { key: "status", label: "Status" },
  { key: "remarks", label: "Remarks" },
];

export const dateFilter = (dateRange: { to: string; from: string }) => {
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

  return dateFilter;
};
