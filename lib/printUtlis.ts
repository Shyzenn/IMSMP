import { OrderView } from "@/app/components/transaction/cashier/CashierAction";
import { EmergencyOrderModalData } from "@/lib/interfaces";

// ============================================
// Constants
// ============================================

const RECEIPT_WIDTH = 32;
const PRODUCT_NAME_WIDTH = 16;
const QTY_WIDTH = 5;
const AMOUNT_WIDTH = 11;

// ESC/POS Commands
const ESC = '\x1B';
const GS = '\x1D';

const ESCPOS = {
  INIT: `${ESC}@`,
  ALIGN_CENTER: `${ESC}a1`,
  ALIGN_LEFT: `${ESC}a0`,
  BOLD_ON: `${ESC}E1`,
  BOLD_OFF: `${ESC}E0`,
  FEED: '\n',
  CUT: `${GS}V\x00`,
  DOUBLE_HEIGHT: `${ESC}!0x10`,
  NORMAL: `${ESC}!0x00`,
};

interface ReceiptData {
  header?: {
    name?: string;
    subtitle?: string;
  };
  orderInfo: Record<string, string>;
  items: Array<{
    productName: string;
    quantity: number;
    price?: number;
  }>;
  footer: {
    requestedBy?: string;
    handledBy?: string;
  };
}

// ============================================
// Helper Functions
// ============================================

const padRight = (text: string, width: number): string => {
  return text.length >= width ? text.substring(0, width) : text + " ".repeat(width - text.length);
};

const padLeft = (text: string, width: number): string => {
  return text.length >= width ? text.substring(0, width) : " ".repeat(width - text.length) + text;
};

const wrapText = (text: string, maxWidth: number): string[] => {
  if (text.length <= maxWidth) return [text];
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  
  for (const word of words) {
    if ((currentLine + word).length <= maxWidth) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
};

const toNumber = (value: unknown): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

const escapeHtml = (text: string): string => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

// ============================================
// Build Receipt (Plain Text)
// ============================================

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
  receipt += "\n\n\n\n";
  
  return receipt;
};

// ============================================
// Build ESC/POS Receipt
// ============================================

const buildESCPOSReceipt = (data: ReceiptData): Uint8Array => {
  let commands = ESCPOS.INIT;
  
  // Header - Centered & Bold
  const headerName = data.header?.name || "Macoleen's Pharmacy";
  const headerSubtitle = data.header?.subtitle || "Order Receipt";
  
  commands += ESCPOS.ALIGN_CENTER;
  commands += ESCPOS.BOLD_ON;
  commands += headerName + ESCPOS.FEED;
  commands += ESCPOS.BOLD_OFF;
  commands += headerSubtitle + ESCPOS.FEED;
  commands += ESCPOS.ALIGN_LEFT;
  commands += "-".repeat(RECEIPT_WIDTH) + ESCPOS.FEED;
  
  // Order info
  for (const [key, value] of Object.entries(data.orderInfo)) {
    commands += `${key}: ${value}${ESCPOS.FEED}`;
  }
  commands += "-".repeat(RECEIPT_WIDTH) + ESCPOS.FEED;
  
  // Table headers
  commands += padRight("Product", PRODUCT_NAME_WIDTH) + 
              padRight("Qty", QTY_WIDTH) + 
              "Amount" + ESCPOS.FEED;
  commands += "-".repeat(RECEIPT_WIDTH) + ESCPOS.FEED;
  
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
    
    commands += padRight(productLines[0], PRODUCT_NAME_WIDTH) + 
                qtyStr + 
                pricePadded + ESCPOS.FEED;
    
    for (let i = 1; i < productLines.length; i++) {
      commands += padRight(productLines[i], RECEIPT_WIDTH) + ESCPOS.FEED;
    }
    commands += ESCPOS.FEED;
  }
  
  // Total
  commands += "-".repeat(RECEIPT_WIDTH) + ESCPOS.FEED;
  commands += ESCPOS.BOLD_ON;
  commands += padLeft("TOTAL:", 22) + 
              padLeft(`PHP${runningTotal.toFixed(2)}`, AMOUNT_WIDTH) + ESCPOS.FEED;
  commands += ESCPOS.BOLD_OFF;
  commands += "-".repeat(RECEIPT_WIDTH) + ESCPOS.FEED;
  
  // Footer
  if (data.footer.requestedBy) {
    commands += `Requested By: ${data.footer.requestedBy}${ESCPOS.FEED}`;
  }
  if (data.footer.handledBy) {
    commands += `Handled By: ${data.footer.handledBy}${ESCPOS.FEED}`;
  }
  
  // Feed and cut
  commands += ESCPOS.FEED + ESCPOS.FEED + ESCPOS.FEED;
  commands += ESCPOS.CUT;
  
  // Convert to Uint8Array
  const encoder = new TextEncoder();
  return encoder.encode(commands);
};

// ============================================
// Bluetooth Printing
// ============================================

let connectedDevice: BluetoothDevice | null = null;
let printerCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

const PRINTER_SERVICE_UUID = "000018f0-0000-1000-8000-00805f9b34fb";
const PRINTER_CHARACTERISTIC_UUID = "00002af1-0000-1000-8000-00805f9b34fb";

export const connectBluetoothPrinter = async (): Promise<boolean> => {
  try {
    // Check if Web Bluetooth is available
    if (!navigator.bluetooth) {
      alert("Web Bluetooth is not supported on this device/browser.");
      return false;
    }

    // Request device
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        { services: [PRINTER_SERVICE_UUID] },
        { name: "BlueTooth Printer" },
        { namePrefix: "BT" },
        { namePrefix: "TP" },
      ],
      optionalServices: [PRINTER_SERVICE_UUID],
    });

    connectedDevice = device;

    // Connect to GATT server
    const server = await device.gatt?.connect();
    if (!server) throw new Error("Failed to connect to GATT server");

    // Get service
    const service = await server.getPrimaryService(PRINTER_SERVICE_UUID);
    
    // Get characteristic
    printerCharacteristic = await service.getCharacteristic(PRINTER_CHARACTERISTIC_UUID);

    console.log("Bluetooth printer connected successfully");
    return true;
  } catch (error) {
    console.error("Bluetooth connection error:", error);
    alert("Failed to connect to Bluetooth printer. Please try again.");
    return false;
  }
};

export const disconnectBluetoothPrinter = (): void => {
  if (connectedDevice?.gatt?.connected) {
    connectedDevice.gatt.disconnect();
  }
  connectedDevice = null;
  printerCharacteristic = null;
};

const printViaBluetooth = async (data: Uint8Array): Promise<boolean> => {
  try {
    if (!printerCharacteristic) {
      const connected = await connectBluetoothPrinter();
      if (!connected) return false;
    }

    if (!printerCharacteristic) {
      throw new Error("No printer characteristic available");
    }

    // Send data in chunks (some printers have buffer limits)
    const chunkSize = 512;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await printerCharacteristic.writeValue(chunk);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between chunks
    }

    return true;
  } catch (error) {
    console.error("Bluetooth print error:", error);
    alert("Failed to print via Bluetooth. Please check your printer.");
    return false;
  }
};

// ============================================
// Desktop/Browser Print
// ============================================

const printViaDesktop = (receipt: string): boolean => {
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

// ============================================
// Smart Print Function (Auto-detect)
// ============================================

const isMobileAndroid = (): boolean => {
  return /Android/i.test(navigator.userAgent);
};

// RawBT Printing for Android
const printViaRawBT = (receipt: string): boolean => {
  try {
    // ESC/POS control codes
    const ESC = '\x1B';
    const GS = '\x1D';
    
    const INIT = ESC + '@';
    const ALIGN_CENTER = ESC + 'a\x01';
    const ALIGN_LEFT = ESC + 'a\x00';
    const BOLD_ON = ESC + 'E\x01';
    const BOLD_OFF = ESC + 'E\x00';
    const FEED_LINES = ESC + 'd\x03';
    const CUT = GS + 'V\x00';
    
    // Build ESC/POS formatted receipt
    const escposData = 
      INIT +
      ALIGN_CENTER +
      BOLD_ON +
      "Macoleen's Pharmacy\n" +
      BOLD_OFF +
      "Order Receipt\n" +
      ALIGN_LEFT +
      "-".repeat(RECEIPT_WIDTH) + "\n" +
      receipt +
      ALIGN_CENTER +
      "\nThank you!\n" +
      FEED_LINES +
      CUT;
    
    // Encode to base64 for RawBT
    const utf8Bytes = new TextEncoder().encode(escposData);
    let binary = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    const base64Data = btoa(binary);
    
    // Use RawBT intent URL
    const rawbtUrl = `rawbt:base64,${base64Data}`;
    
    // Create a temporary link and click it
    const link = document.createElement('a');
    link.href = rawbtUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Sent to RawBT');
    return true;
  } catch (error) {
    console.error('RawBT print error:', error);
    return false;
  }
};

const smartPrint = async (receiptData: ReceiptData): Promise<boolean> => {
  const isAndroid = isMobileAndroid();
  const plainReceipt = buildReceipt(receiptData);

  if (isAndroid) {
    // Check if RawBT is available by checking for the app
    // Try RawBT first (simpler and more reliable for Android)
    try {
      return printViaRawBT(plainReceipt);
    } catch (error) {
      console.error('RawBT failed, trying Web Bluetooth:', error);
      
      // Fallback to Web Bluetooth if available
      const hasWebBluetooth = 'bluetooth' in navigator;
      if (hasWebBluetooth) {
        const escposData = buildESCPOSReceipt(receiptData);
        const bluetoothSuccess = await printViaBluetooth(escposData);
        if (bluetoothSuccess) return true;
      }
    }
  }

  // Desktop or final fallback: use regular browser print
  return printViaDesktop(plainReceipt);
};

// ============================================
// Main Export Functions
// ============================================

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
    
    const success = await smartPrint(receiptData);
    
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
    
    const success = await smartPrint(receiptData);
    
    if (success) {
      closeModal();
    }
  } catch (error) {
    console.error("Error in handleEmergencyPrint:", error);
  }
};

// Optional: Export function to manually connect to printer
export const manualConnectPrinter = async (): Promise<boolean> => {
  return await connectBluetoothPrinter();
};