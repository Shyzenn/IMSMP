"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Search from "./Search";
import BatchFilter from "./Inventory/batches/BatchFilter";
import AddProductForm from "./Inventory/products/AddProductform";
import ProductFilter from "./Inventory/products/ProductFilter";
import TransactionFilter from "./transaction/TransactionFilter";
import AuditFilter from "./auditLog/AuditFilter";
import ArchiveFilter from "./archive/ArchiveFilter";
import { MdOutlineFileDownload } from "react-icons/md";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DateRangeFilter } from "./DateRangeFilter";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";

interface PageTableHeaderProps {
  title: string;
  hasAddProduct?: boolean;
  isProductFilter?: boolean;
  isTransactionFilter?: boolean;
  isBatchFilter?: boolean;
  isArchiveFilter?: boolean;
  productExport?: boolean;
  batchExport?: boolean;
  transactionExport?: boolean;
  hasDateFilter?: boolean;
  searchPlaceholder: string;
}

type ProductRow = {
  product_name: string;
  category?: { name: string } | null;
  totalQty?: number;
  batchNumber?: number;
  quantity?: number;
  releaseDate?: string | null;
  expiryDate?: string | null;
  product?: {
    product_name: string;
    category?: { name: string } | null;
  };
  batches?: { quantity: number }[];
};

type TransactionRow = {
  id: string;
  customer: string;
  source: "Walk In" | "Request Order";
  createdAt: string | Date;
  quantity: number;
  total: number;
  status: string;
};

type Sales = {
  product_name: string;
  category: string;
  price: number;
  date: Date;
  revenue: number;
};

type TableCell =
  | string
  | number
  | {
      content: string | number;
      colSpan?: number;
      styles?: Record<string, unknown>;
    };

type TableRow = TableCell[];

const PageTableHeader: React.FC<PageTableHeaderProps> = ({
  title,
  hasAddProduct,
  isProductFilter,
  isTransactionFilter,
  isBatchFilter,
  isArchiveFilter,
  productExport,
  batchExport,
  transactionExport,
  hasDateFilter,
  searchPlaceholder,
}) => {
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);

  const handleTransactionDownload = async () => {
    try {
      const res = await fetch(`/api/transaction/export`);
      if (!res.ok) throw new Error("Failed to fetch transactions");

      const data = await res.json();

      exportTransactionPDF(data);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSalesDownload = async () => {
    try {
      const res = await fetch(`/api/report/sales`);
      if (!res.ok) throw new Error("Failed to fetch sales data");
      const data = await res.json();
      exportSalesPDF(data);
    } catch (error) {
      console.error("Sales download failed:", error);
    }
  };

  const exportSalesPDF = (sales: Sales[]) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // 🔹 Group sales by date
    const groupedSales = sales.reduce((acc, sale) => {
      let dateKey = "";
      if (sale.date && !isNaN(new Date(sale.date).getTime())) {
        dateKey = new Date(sale.date).toISOString().split("T")[0];
      }

      if (!dateKey) return acc;
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(sale);

      return acc;
    }, {} as Record<string, Sales[]>);

    const columns = ["Product Name", "Category", "Price", "Revenue"];
    const allRows: TableRow[] = [];
    let grandTotal = 0;

    // 🔹 Build rows grouped by date
    for (const [date, daySales] of Object.entries(groupedSales)) {
      const totalRevenue = daySales.reduce(
        (sum, s) => sum + (Number(s.revenue) || 0),
        0
      );
      grandTotal += totalRevenue;

      // 🗓️ Date header row
      allRows.push([
        {
          content: `Date: ${date}`,
          colSpan: 4,
          styles: {
            halign: "left",
            fontStyle: "bold",
            fillColor: [230, 230, 230],
          },
        },
      ]);

      // 💰 Sales rows
      daySales.forEach((sale) => {
        const price = Number(sale.price) || 0;
        allRows.push([
          sale.product_name || "",
          sale.category || "",
          price.toFixed(2),
          (Number(sale.revenue) || 0).toFixed(2),
        ]);
      });

      // ➕ Add subtotal row for this day
      allRows.push([
        { content: "Subtotal", styles: { fontStyle: "bold", halign: "right" } },
        "",
        "",
        {
          content: totalRevenue.toFixed(2),
          styles: {
            fontStyle: "bold",
            halign: "center",
            fillColor: [240, 240, 240],
          },
        },
      ]);

      // Add a small gap after each day
      allRows.push(["", "", "", ""]);
    }

    // 🔹 Grand total at the bottom
    allRows.push(["", "", "", ""]);
    allRows.push([
      {
        content: "GRAND TOTAL",
        styles: { fontStyle: "bold", halign: "right" },
      },
      "",
      "",
      {
        content: grandTotal.toFixed(2),
        styles: {
          fontStyle: "bold",
          halign: "center",
          fillColor: [220, 220, 220],
        },
      },
    ]);

    // 🔹 Generate the PDF table
    autoTable(doc, {
      head: [columns],
      body: allRows,
      startY: 20,
      theme: "striped",
      styles: {
        halign: "center",
        valign: "middle",
        cellWidth: "wrap",
        overflow: "linebreak",
        fontSize: 10,
      },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { top: 25, bottom: 15 },
      didDrawPage: () => {
        doc.text("Sales Report", 14, 15);
      },
      showHead: "everyPage",
      pageBreak: "auto",
    });

    doc.save("Sales_Report.pdf");
  };

  const handleDateChange = (range: { from?: Date; to?: Date }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (range.from) params.set("from", format(range.from, "yyyy-MM-dd"));
    else params.delete("from");
    if (range.to) params.set("to", format(range.to, "yyyy-MM-dd"));
    else params.delete("to");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const exportTransactionPDF = (transactions: TransactionRow[]) => {
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = "/macoleens_logo.png";

    const userName = session?.user?.username || "Unknown User";
    const today = new Date().toLocaleDateString();

    logo.onload = () => {
      // Center the logo
      const pageWidth = doc.internal.pageSize.getWidth();
      const maxWidth = 60;
      const aspectRatio = logo.height / logo.width;
      const logoWidth = maxWidth;
      const logoHeight = logoWidth * aspectRatio;
      const logoX = (pageWidth - logoWidth) / 2;

      doc.addImage(logo, "PNG", logoX, 10, logoWidth, logoHeight);

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Transactions Report", pageWidth / 2, 38, { align: "center" });

      // Description
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        "This report summarizes all recorded transactions, including customer details, type, and total amount.",
        pageWidth / 2,
        46,
        { align: "center", maxWidth: 180 }
      );

      // Metadata
      doc.setFontSize(10);
      doc.text(`Generated on: ${today}`, 14, 56);
      doc.text(`Generated by: ${userName}`, 14, 62);

      // Table
      const columns = [
        "ID",
        "Customer",
        "Type",
        "Created At",
        "Quantity",
        "Total",
        "Status",
      ];

      const rows = transactions.map((tx) => [
        tx.id,
        tx.customer,
        tx.source,
        new Date(tx.createdAt).toLocaleDateString(),
        tx.quantity,
        tx.total.toFixed(2),
        tx.status === "pending"
          ? "Pending"
          : tx.status === "for_payment"
          ? "For Payment"
          : tx.status === "paid"
          ? "Paid"
          : tx.status === "refunded"
          ? "Refunded"
          : tx.status,
      ]);

      autoTable(doc, {
        startY: 70,
        head: [columns],
        body: rows,
      });

      doc.save("transactions.pdf");
    };
  };

  const handleDownload = async (type: string) => {
    try {
      const res = await fetch(`/api/product/export?type=${type}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data: ProductRow[] = await res.json();

      if (!data || data.length === 0) {
        setShowModal(true);
        return;
      }

      exportPDF(data, type);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const exportPDF = (data: ProductRow[], type: string) => {
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = "/macoleens_logo.png";

    const userName = session?.user?.username || "Unknown User";
    const today = new Date().toLocaleDateString();

    // Choose brief description based on report type
    const descriptions: Record<string, string> = {
      all: "This report lists all active products with their categories and stock quantities.",
      allBatches:
        "This report shows all active product batches, including release and expiry dates.",
      lowStock:
        "This report lists products with low stock quantities below the threshold.",
      expiring:
        "This report highlights batches nearing expiry within the next 7 days.",
      expired:
        "This report lists all product batches that have already expired.",
    };

    const description =
      descriptions[type] || "This report provides product data.";

    logo.onload = () => {
      // Center the logo
      const pageWidth = doc.internal.pageSize.getWidth();
      const logoWidth = 60;
      const logoX = (pageWidth - logoWidth) / 2;
      doc.addImage(logo, "PNG", logoX, 10, logoWidth, 20);

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`Products Report - ${type}`, pageWidth / 2, 38, {
        align: "center",
      });

      // Description
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(description, pageWidth / 2, 46, {
        align: "center",
        maxWidth: 180,
      });

      // Metadata
      doc.text(`Generated on: ${today}`, 14, 56);
      doc.text(`Generated by: ${userName}`, 14, 62);

      let columns: string[] = [];
      let rows: (string | number)[][] = [];

      if (type === "lowStock" || type === "all") {
        columns = ["Product", "Category", "Quantity"];
        rows = data.map((item) => [
          item.product_name,
          item.category?.name || "-",
          item.totalQty ??
            item.batches?.reduce((sum, b) => sum + b.quantity, 0) ??
            0,
        ]);
      } else if (type === "allBatches") {
        columns = [
          "Product",
          "Batch #",
          "Quantity",
          "Release Date",
          "Expiry Date",
        ];
        rows = data.map((item) => [
          item.product?.product_name || "-",
          item.batchNumber ?? "-",
          item.quantity ?? 0,
          item.releaseDate
            ? new Date(item.releaseDate).toLocaleDateString()
            : "-",
          item.expiryDate
            ? new Date(item.expiryDate).toLocaleDateString()
            : "-",
        ]);
      } else {
        columns = ["Product", "Category", "Batch #", "Quantity", "Expiry Date"];
        rows = data.map((item) => [
          item.product?.product_name || item.product_name,
          item.product?.category?.name || "-",
          item.batchNumber ?? "-",
          item.quantity ??
            item.batches?.reduce((sum, b) => sum + b.quantity, 0) ??
            0,
          item.expiryDate
            ? new Date(item.expiryDate).toLocaleDateString()
            : "-",
        ]);
      }

      autoTable(doc, {
        startY: 70,
        head: [columns],
        body: rows,
      });

      doc.save(`products_${type}.pdf`);
    };
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 w-full md:justify-between mb-4">
        <div className="flex items-center gap-4">
          <p className="text-2xl font-semibold">{title}</p>
        </div>
        <div className="w-auto md:w-[10rem] lg:w-[30rem] border px-6 rounded-full flex items-center gap-2 bg-gray-50">
          <Search placeholder={searchPlaceholder} />
        </div>
        <div className="flex gap-4 flex-col md:flex-row md:items-center md:justify-end">
          <div className="flex gap-4">
            {isProductFilter ? (
              <ProductFilter />
            ) : isTransactionFilter ? (
              <TransactionFilter />
            ) : isBatchFilter ? (
              <BatchFilter />
            ) : isArchiveFilter ? (
              <ArchiveFilter />
            ) : (
              <AuditFilter />
            )}

            {batchExport && (
              <>
                {(session?.user.role === "Manager" ||
                  session?.user.role === "Pharmacist_Staff") && (
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">PDF Export</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => handleDownload("allBatches")}
                        >
                          All Batches
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleDownload("expiring")}
                        >
                          Expiring Batches
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownload("expired")}
                        >
                          Expired Batches
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex justify-between md:gap-4 md:flex-row-reverse items-center">
            {hasDateFilter && <DateRangeFilter onChange={handleDateChange} />}

            {transactionExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">PDF Export</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleSalesDownload}>
                    Sales
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleTransactionDownload}>
                    Transaction
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {hasAddProduct && (
              <>
                {(session?.user.role === "Manager" ||
                  session?.user.role === "Pharmacist_Staff") && (
                  <div>
                    <AddProductForm />
                  </div>
                )}
              </>
            )}
            {productExport && (
              <>
                {(session?.user.role === "Manager" ||
                  session?.user.role === "Pharmacist_Staff") && (
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="border rounded-md flex py-2 md:py-[7px] md:text-sm px-4 gap-2 items-center font-semibold hover:bg-slate-50 duration-200 ease-in-out">
                          PDF <MdOutlineFileDownload />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleDownload("all")}>
                          All Products
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleDownload("lowStock")}
                        >
                          Low Stock Products
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Data Found</DialogTitle>
            <DialogDescription>
              There are no products available for this report.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowModal(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PageTableHeader;
