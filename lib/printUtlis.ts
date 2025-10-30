import { OrderView } from "@/app/components/transaction/cashier/CashierAction";
import { EmergencyOrderModalData, WalkInOrder } from "./interfaces";

const RECEIPT_WIDTH = 32;
const PRODUCT_NAME_WIDTH = 18;
const QTY_WIDTH = 4;
const AMOUNT_WIDTH = 10;

const padRight = (text: string, length: number): string =>
  text.length >= length
    ? text.slice(0, length)
    : text + " ".repeat(length - text.length);

const padLeft = (text: string, length: number): string =>
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
  
  // Handle objects with numeric conversion methods
  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    if (typeof obj.toNumber === "function") {
      return (obj.toNumber as () => number)();
    }
    if (typeof obj.toFixed === "function") {
      const maybe = Number((obj.toFixed as (d?: number) => string)(2));
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
    const testLine = current ? `${current} ${word}` : word;
    if (testLine.length <= width) {
      current = testLine;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
};

const escapeHtml = (s: string): string =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

// ============================================
// Receipt Builder
// ============================================

interface ReceiptItem {
  productName: string;
  quantity: number;
  price?: number;
}

interface ReceiptData {
  header?: {
    name: string;
    subtitle: string;
  };
  orderInfo: Record<string, string>;
  items: ReceiptItem[];
  footer: {
    requestedBy?: string;
    handledBy?: string;
  };
}

const buildReceipt = (data: ReceiptData): string => {
  let receipt = "";
  
  // Header
  const headerName = data.header?.name || "Macoleen's Pharmacy";
  const headerSubtitle = data.header?.subtitle || "Order Receipt";
  receipt += headerName.padStart((RECEIPT_WIDTH + headerName.length) / 2) + "\n";
  receipt += headerSubtitle.padStart((RECEIPT_WIDTH + headerSubtitle.length) / 2) + "\n";
  receipt += "-".repeat(RECEIPT_WIDTH) + "\n";
  
  // Order info
  for (const [key, value] of Object.entries(data.orderInfo)) {
    receipt += `${key}: ${value}\n`;
  }
  receipt += "-".repeat(RECEIPT_WIDTH) + "\n";
  
  // Table headers
  receipt += padRight("Product", PRODUCT_NAME_WIDTH) + 
             padRight("Qty", QTY_WIDTH) + 
             "Amount\n";
  receipt += "-".repeat(RECEIPT_WIDTH) + "\n";
  
  // Items
  let runningTotal = 0;
  
  for (const item of data.items) {
    const productLines = wrapText(item.productName, PRODUCT_NAME_WIDTH);
    const qtyNum = Number(item.quantity ?? 0) || 0;
    const priceNum = toNumber(item.price);
    const lineTotal = qtyNum * priceNum;
    runningTotal += lineTotal;
    
    const qtyStr = padLeft(String(qtyNum), QTY_WIDTH);
    const lineTotalStr = `PHP${lineTotal.toFixed(2)}`;
    const pricePadded = padLeft(lineTotalStr, AMOUNT_WIDTH);
    
    // First line with qty and price
    receipt += padRight(productLines[0], PRODUCT_NAME_WIDTH) + 
               qtyStr + 
               pricePadded + "\n";
    
    // Wrapped lines (if any)
    for (let i = 1; i < productLines.length; i++) {
      receipt += padRight(productLines[i], RECEIPT_WIDTH) + "\n";
    }
    
    // Item separator
    receipt += "\n";
  }
  
  // Footer & total
  receipt += "-".repeat(RECEIPT_WIDTH) + "\n";
  receipt += padLeft("TOTAL:", 22) + 
             padLeft(`PHP${runningTotal.toFixed(2)}`, AMOUNT_WIDTH) + "\n";
  receipt += "-".repeat(RECEIPT_WIDTH) + "\n";
  
  if (data.footer.requestedBy) {
    receipt += `Requested By: ${data.footer.requestedBy}\n`;
  }
  if (data.footer.handledBy) {
    receipt += `Handled By: ${data.footer.handledBy}\n`;
  }
  
  // Extra spacing for tear-off
  receipt += "\n\n\n\n\n\n\n\n";
  
  return receipt;
};

// ============================================
// Print Function
// ============================================

const printReceipt = (receipt: string): boolean => {
  try {
    const printWindow = window.open("", "printReceipt", "width=400,height=600");
    if (!printWindow) {
      console.error("Failed to open print window");
      return false;
    }
    
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
    
    return true;
  } catch (error) {
    console.error("Print error:", error);
    return false;
  }
};


export const handlePrint = async (
  selectedOrder: OrderView | null,
  setIsConfirmOpen: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> => {
  if (!selectedOrder) return;
  
  try {
    const receiptData: ReceiptData = {
      orderInfo: {
        Patient: selectedOrder.patient_name,
        Room: selectedOrder.roomNumber,
        Date: new Date(selectedOrder.createdAt).toLocaleString("en-PH"),
        Type: selectedOrder.type,
      },
      items: selectedOrder.itemDetails,
      footer: {
        requestedBy: selectedOrder.requestedBy,
      },
    };
    
    const receipt = buildReceipt(receiptData);
    const success = printReceipt(receipt);
    
    if (success) {
      setIsConfirmOpen(true);
    }
  } catch (error) {
    console.error("Error in handlePrint:", error);
  }
};

export const handleEmergencyPrint = async (
  orderData: EmergencyOrderModalData | null,
  closeModal: () => void
): Promise<void> => {
  if (!orderData) return;
  
  try {
    const receiptData: ReceiptData = {
      orderInfo: {
        Patient: orderData.order.patient_name,
        Room: orderData.order.room_number,
        Date: new Date(orderData.createdAt).toLocaleString("en-PH"),
        Type: orderData.orderType === "EMERGENCY" ? "Pay Later" : orderData.orderType,
      },
      items: orderData.order.products,
      footer: {
        requestedBy: orderData.sender.username,
      },
    };
    
    const receipt = buildReceipt(receiptData);
    const success = printReceipt(receipt);
    
    if (success) {
      closeModal();
    }
  } catch (error) {
    console.error("Error in handleEmergencyPrint:", error);
  }
};

export const handleWalkInPrint = async (
  selectedOrder: WalkInOrder | null,
  printWindow: Window
): Promise<void> => {
  if (!selectedOrder) return;
  
  try {
    const receiptData: ReceiptData = {
      orderInfo: {
        Customer: selectedOrder.customer,
        Date: new Date(selectedOrder.createdAt).toLocaleString("en-PH"),
        Type: "Walk In",
      },
      items: selectedOrder.itemDetails,
      footer: {
        handledBy: selectedOrder.handledBy,
      },
    };
    
    const receipt = buildReceipt(receiptData);
    
    // Use provided window for walk-in
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
  } catch (error) {
    console.error("Error in handleWalkInPrint:", error);
  }
};