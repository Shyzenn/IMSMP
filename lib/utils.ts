import { OrderView } from "@/app/components/transaction/cashier/CashierAction";
import { OrderType, Status } from "@prisma/client";
import { clsx, type ClassValue } from "clsx"
import { endOfDay, formatDistanceToNow, parseISO, startOfDay } from "date-fns";
import { twMerge } from "tailwind-merge"
import { EmergencyOrderModalData, WalkInOrder } from "./interfaces";

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

// export const typeLabels = {
//   REGULAR: "Regular",
//   EMERGENCY: "Pay Later",
// };

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

export const handlePrint = async (selectedOrder: OrderView | null, setIsConfirmOpen:React.Dispatch<React.SetStateAction<boolean>>) => {
    if (!selectedOrder) return;

    const padRight = (text: string, length: number) =>
      text.length >= length
        ? text.slice(0, length)
        : text + " ".repeat(length - text.length);

    const padLeft = (text: string, length: number) =>
      text.length >= length
        ? text.slice(0, length)
        : " ".repeat(length - text.length) + text;

    const toNumber = (val: unknown): number => {
      if (val == null) return 0;

      if (typeof val === "number") return val;

      if (typeof val === "string") {
        const n = Number(val.replace(/[^0-9.\-]/g, ""));
        return Number.isFinite(n) ? n : 0;
      }

      if (typeof val === "bigint") return Number(val);

      if (typeof val === "object") {
        const obj = val as {
          toNumber?: () => number;
          toFixed?: (digits?: number) => string;
        };
        if (typeof obj.toNumber === "function") return obj.toNumber();
        if (typeof obj.toFixed === "function") {
          const maybe = Number(obj.toFixed(2));
          return Number.isFinite(maybe) ? maybe : 0;
        }
      }

      return 0;
    };

    const wrapText = (text: string, width: number): string[] => {
      const words = text.split(" ");
      const lines: string[] = [];
      let current = "";

      for (const word of words) {
        if ((current + word).length + 1 <= width) {
          current += (current ? " " : "") + word;
        } else {
          lines.push(current);
          current = word;
        }
      }
      if (current) lines.push(current);
      return lines;
    };

    const width = 32;
    let receipt = "";

    // Header
    receipt += "       Macoleen's Pharmacy\n";
    receipt += "          Order Receipt\n";
    receipt += "-".repeat(width) + "\n";

    // Order info
    receipt += `Patient: ${selectedOrder.patient_name}\n`;
    receipt += `Room: ${selectedOrder.roomNumber}\n`;
    receipt += `Date: ${new Date(selectedOrder.createdAt).toLocaleString(
      "en-PH"
    )}\n`;
    receipt += `Type: ${selectedOrder.type}\n`;
    receipt += "-".repeat(width) + "\n";

    // Table headers
    receipt += padRight("Product", 18) + padRight("Qty", 4) + "Amount\n";
    receipt += "-".repeat(width) + "\n";

    let runningTotal = 0;

    selectedOrder.itemDetails.forEach((item) => {
      const productLines = wrapText(item.productName, 18);
      const qtyNum = Number(item.quantity ?? 0) || 0;
      const priceNum = toNumber(item.price);
      const lineTotal = qtyNum * priceNum;
      runningTotal += lineTotal;

      const qtyStr = padLeft(String(qtyNum), 4);
      const lineTotalStr = `PHP${lineTotal.toFixed(2)}`;
      const pricePadded = padLeft(lineTotalStr, 10);

      // Product main line
      receipt += padRight(productLines[0], 18) + qtyStr + pricePadded + "\n";

      // Wrapped product lines (no qty/price)
      for (let i = 1; i < productLines.length; i++) {
        receipt += padRight(productLines[i], width) + "\n";
      }

      // Add a truly visible blank line between items
      receipt += "\n \n"; // <-- extra space line makes it consistent across printers
    });

    // Footer & total
    receipt += "-".repeat(width) + "\n";
    receipt +=
      padLeft("TOTAL:", 22) +
      padLeft(`PHP${runningTotal.toFixed(2)}`, 10) +
      "\n";
    receipt += "-".repeat(width) + "\n";

    receipt += `Requested By: ${selectedOrder.requestedBy}\n`;
    receipt += "\n\n\n\n\n\n\n\n";

    // Print popup
    const printWindow = window.open("", "printReceipt", "width=400,height=600");
    if (!printWindow) return;

    const escapeHtml = (s: string) =>
      s
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");

    printWindow.document.write(`
    <html>
      <head>
        <title>Macoleen's Pharmacy Receipt</title>
        <style>
          @page { margin: 0; }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4; /* more readable */
            white-space: pre;
            margin: 0;
            padding: 0 8px 150px 8px;
          }
          pre {
            margin: 0;
            line-height: 1.6; /* extra spacing between lines */
          }
        </style>
      </head>
      <body>
        <pre>${escapeHtml(receipt)}</pre>
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();

    setIsConfirmOpen(true);
  };

  export const handleEmergencyPrint = async (orderData: EmergencyOrderModalData | null, closeModal: () => void) => {
    if (!orderData) return;
    console.log("🧾 Products data:", orderData.order.products);


    const padRight = (text: string, length: number) =>
      text.length >= length
        ? text.slice(0, length)
        : text + " ".repeat(length - text.length);

    const padLeft = (text: string, length: number) =>
      text.length >= length
        ? text.slice(0, length)
        : " ".repeat(length - text.length) + text;

    const toNumber = (val: unknown): number => {
      if (val == null) return 0;

      if (typeof val === "number") return val;

      if (typeof val === "string") {
        const n = Number(val.replace(/[^0-9.\-]/g, ""));
        return Number.isFinite(n) ? n : 0;
      }

      if (typeof val === "bigint") return Number(val);

      if (typeof val === "object") {
        const obj = val as {
          toNumber?: () => number;
          toFixed?: (digits?: number) => string;
        };
        if (typeof obj.toNumber === "function") return obj.toNumber();
        if (typeof obj.toFixed === "function") {
          const maybe = Number(obj.toFixed(2));
          return Number.isFinite(maybe) ? maybe : 0;
        }
      }

      return 0;
    };

    const wrapText = (text: string, width: number): string[] => {
      const words = text.split(" ");
      const lines: string[] = [];
      let current = "";

      for (const word of words) {
        if ((current + word).length + 1 <= width) {
          current += (current ? " " : "") + word;
        } else {
          lines.push(current);
          current = word;
        }
      }
      if (current) lines.push(current);
      return lines;
    };

    const width = 32;
    let receipt = "";

    // Header
    receipt += "       Macoleen's Pharmacy\n";
    receipt += "          Order Receipt\n";
    receipt += "-".repeat(width) + "\n";

    // Order info
    receipt += `Patient: ${orderData.order.patient_name}\n`;
    receipt += `Room: ${orderData.order.room_number}\n`;
    receipt += `Date: ${new Date(orderData.createdAt).toLocaleString(
      "en-PH"
    )}\n`;
    receipt += `Type: ${orderData.orderType === "EMERGENCY" ? "Pay Later" : orderData.orderType}\n`;
    receipt += "-".repeat(width) + "\n";

    // Table headers
    receipt += padRight("Product", 18) + padRight("Qty", 4) + "Amount\n";
    receipt += "-".repeat(width) + "\n";

    let runningTotal = 0;

    orderData.order.products.forEach((item) => {
      const productLines = wrapText(item.productName, 18);
      const qtyNum = Number(item.quantity ?? 0) || 0;
      const priceNum = toNumber(item.price);
      const lineTotal = qtyNum * priceNum;
      runningTotal += lineTotal;

      const qtyStr = padLeft(String(qtyNum), 4);
      const lineTotalStr = `PHP${lineTotal.toFixed(2)}`;
      const pricePadded = padLeft(lineTotalStr, 10);

      // Product main line
      receipt += padRight(productLines[0], 18) + qtyStr + pricePadded + "\n";

      // Wrapped product lines (no qty/price)
      for (let i = 1; i < productLines.length; i++) {
        receipt += padRight(productLines[i], width) + "\n";
      }

      // Add a truly visible blank line between items
      receipt += "\n \n"; // <-- extra space line makes it consistent across printers
    });

    // Footer & total
    receipt += "-".repeat(width) + "\n";
    receipt +=
      padLeft("TOTAL:", 22) +
      padLeft(`PHP${runningTotal.toFixed(2)}`, 10) +
      "\n";
    receipt += "-".repeat(width) + "\n";

    receipt += `Requested By: ${orderData.sender.username}\n`;
    receipt += "\n\n\n\n\n\n\n\n";

    // Print popup
    const printWindow = window.open("", "printReceipt", "width=400,height=600");
    if (!printWindow) return;

    const escapeHtml = (s: string) =>
      s
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");

    printWindow.document.write(`
    <html>
      <head>
        <title>Macoleen's Pharmacy Receipt</title>
        <style>
          @page { margin: 0; }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4; /* more readable */
            white-space: pre;
            margin: 0;
            padding: 0 8px 150px 8px;
          }
          pre {
            margin: 0;
            line-height: 1.6; /* extra spacing between lines */
          }
        </style>
      </head>
      <body>
        <pre>${escapeHtml(receipt)}</pre>
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();

    closeModal();
  };

  export const handleWalkInPrint = async (selectedOrder: WalkInOrder | null, printWindow: Window) => {
    const padRight = (text: string, length: number) =>
    text.length >= length
      ? text.slice(0, length)
      : text + " ".repeat(length - text.length);

  const padLeft = (text: string, length: number) =>
    text.length >= length
      ? text.slice(0, length)
      : " ".repeat(length - text.length) + text;

  const toNumber = (val: unknown): number => {
    if (val == null) return 0;
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const n = Number(val.replace(/[^0-9.\-]/g, ""));
      return Number.isFinite(n) ? n : 0;
    }
    if (typeof val === "bigint") return Number(val);
    if (typeof val === "object") {
      const obj = val as {
        toNumber?: () => number;
        toFixed?: (digits?: number) => string;
      };
      if (typeof obj.toNumber === "function") return obj.toNumber();
      if (typeof obj.toFixed === "function") {
        const maybe = Number(obj.toFixed(2));
        return Number.isFinite(maybe) ? maybe : 0;
      }
    }
    return 0;
  };

  const wrapText = (text: string, width: number): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
      if ((current + word).length + 1 <= width) {
        current += (current ? " " : "") + word;
      } else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  const width = 32;
  let receipt = "";

  // Header
  receipt += "       Macoleen's Pharmacy\n";
  receipt += "          Order Receipt\n";
  receipt += "-".repeat(width) + "\n";

  // Order info
  receipt += `Customer: ${selectedOrder?.customer}\n`;
     receipt += `Date: ${new Date(selectedOrder!.createdAt).toLocaleString("en-PH")}\n`;

  receipt += `Type: Walk In\n`;
  receipt += "-".repeat(width) + "\n";

  // Table headers
  receipt += padRight("Product", 18) + padRight("Qty", 4) + "Amount\n";
  receipt += "-".repeat(width) + "\n";

  let runningTotal = 0;

  selectedOrder?.itemDetails.forEach((item) => {
    const productLines = wrapText(item.productName, 18);
    const qtyNum = Number(item.quantity ?? 0) || 0;
    const priceNum = toNumber(item.price);
    const lineTotal = qtyNum * priceNum;
    runningTotal += lineTotal;

    const qtyStr = padLeft(String(qtyNum), 4);
    const lineTotalStr = `PHP${lineTotal.toFixed(2)}`;
    const pricePadded = padLeft(lineTotalStr, 10);

    receipt += padRight(productLines[0], 18) + qtyStr + pricePadded + "\n";

    for (let i = 1; i < productLines.length; i++) {
      receipt += padRight(productLines[i], width) + "\n";
    }

    receipt += "\n \n";
  });

  // Footer & total
  receipt += "-".repeat(width) + "\n";
  receipt += padLeft("TOTAL:", 22) + padLeft(`PHP${runningTotal.toFixed(2)}`, 10) + "\n";
  receipt += "-".repeat(width) + "\n";
  receipt += `Handled By: ${selectedOrder?.handledBy}\n`;
  receipt += "\n\n\n\n\n\n\n\n";

  const escapeHtml = (s: string) =>
    s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");

  printWindow.document.open();
  printWindow.document.write(`
    <html>
      <head>
        <title>Macoleen's Pharmacy Receipt</title>
        <style>
          @page { margin: 0; }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            white-space: pre;
            margin: 0;
            padding: 0 8px 150px 8px;
          }
          pre {
            margin: 0;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <pre>${escapeHtml(receipt)}</pre>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};