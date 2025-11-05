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
import { DateRangeFilter } from "./DateRangeFilter";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { generateBatchPDF } from "@/lib/reportUtils/batchReport";
import { generateProductPDF } from "@/lib/reportUtils/productReport";
import { generateSalesPDF } from "@/lib/reportUtils/salesReport";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Body } from "../api/report/sales/route";

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
  const [isExporting, setIsExporting] = useState(false);
  const [modalMessage, setModalMessage] = useState({
    title: "No Data Found",
    description: "There are no products available for this report.",
  });
  const [showSalesReportModal, setShowSalesReportModal] = useState(false);

  // Sales report state
  const [salesDateRange, setSalesDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});
  const [salesType, setSalesType] = useState<string>("all");

  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFilter = searchParams.get("filter") || "all";
  const currentQuery = searchParams.get("query") || "";
  const currentStockFilter = searchParams.get("stockFilter") || "all";

  const handleProductExport = async (type: "all" | "lowStock") => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        type,
        filter: currentFilter,
        query: currentQuery,
        stockFilter: currentStockFilter,
      });

      const response = await fetch(`/api/report/product?${params.toString()}`);

      if (response.status === 404) {
        setModalMessage({
          title: "No Data Found",
          description: "There are no products matching the current filters.",
        });
        setShowModal(true);
        return;
      }

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const data = await response.json();
      const username = session?.user?.username || "Unknown User";
      generateProductPDF(data.products, data.meta, username);
    } catch (error) {
      console.error("Export error:", error);
      setModalMessage({
        title: "Export Failed",
        description: "There was an error generating the PDF. Please try again.",
      });
      setShowModal(true);
    } finally {
      setIsExporting(false);
    }
  };

  const handleBatchExport = async (type: string) => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/report/batch?type=${type}`);

      if (response.status === 404) {
        setModalMessage({
          title: "No Data Found",
          description: "There are no batches available for this report.",
        });
        setShowModal(true);
        return;
      }

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const data = await response.json();
      const username = session?.user?.username || "Unknown User";
      generateBatchPDF(data.batches, data.meta, username);
    } catch (error) {
      console.error("Export error:", error);
      setModalMessage({
        title: "Export Failed",
        description: "There was an error generating the PDF. Please try again.",
      });
      setShowModal(true);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSalesExport = async () => {
    setIsExporting(true);
    try {
      const payload: Body = {
        type: salesType,
      };

      if (salesDateRange.from) {
        payload.from = format(salesDateRange.from, "yyyy-MM-dd");
      }
      if (salesDateRange.to) {
        payload.to = format(salesDateRange.to, "yyyy-MM-dd");
      }

      const response = await fetch("/api/report/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 404) {
        setModalMessage({
          title: "No Data Found",
          description:
            "There are no sales transactions for the selected criteria.",
        });
        setShowModal(true);
        setShowSalesReportModal(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const data = await response.json();
      const username = session?.user?.username || "Unknown User";
      generateSalesPDF(data.sales, data.meta, username);

      setShowSalesReportModal(false);
      // Reset filters
      setSalesDateRange({});
      setSalesType("all");
    } catch (error) {
      console.error("Export error:", error);
      setModalMessage({
        title: "Export Failed",
        description: "There was an error generating the PDF. Please try again.",
      });
      setShowModal(true);
      setShowSalesReportModal(false);
    } finally {
      setIsExporting(false);
    }
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={isExporting}
                        className="flex items-center gap-2"
                      >
                        {isExporting ? "Exporting..." : "PDF Export"}
                        <MdOutlineFileDownload
                          className={isExporting ? "animate-bounce" : ""}
                        />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleBatchExport("all")}
                        disabled={isExporting}
                      >
                        All Batches
                        {(currentFilter !== "all" ||
                          currentQuery ||
                          currentStockFilter !== "all") && (
                          <span className="text-xs text-gray-500 ml-2">
                            (filtered)
                          </span>
                        )}
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handleBatchExport("expiring")}
                        disabled={isExporting}
                      >
                        Expiring Batches
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handleBatchExport("expired")}
                        disabled={isExporting}
                      >
                        Expired Batches
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handleBatchExport("consumed")}
                        disabled={isExporting}
                      >
                        Consumed Batches
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </div>

          <div className="flex justify-between md:gap-4 md:flex-row-reverse items-center">
            {hasDateFilter && <DateRangeFilter onChange={handleDateChange} />}

            {transactionExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isExporting}>
                    {isExporting ? "Exporting..." : "PDF Export"}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setShowSalesReportModal(true)}
                  >
                    Sales Report
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
                        <button
                          className="border rounded-md flex py-2 md:py-[7px] md:text-sm px-4 gap-2 items-center font-semibold hover:bg-slate-50 duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isExporting}
                        >
                          {isExporting ? "Exporting..." : "PDF"}
                          <MdOutlineFileDownload
                            className={isExporting ? "animate-bounce" : ""}
                          />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => handleProductExport("all")}
                          disabled={isExporting}
                        >
                          All Products
                          {(currentFilter !== "all" ||
                            currentQuery ||
                            currentStockFilter !== "all") && (
                            <span className="text-xs text-gray-500 ml-2">
                              (filtered)
                            </span>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleProductExport("lowStock")}
                          disabled={isExporting}
                        >
                          Low Stock Products
                          {(currentFilter !== "all" || currentQuery) && (
                            <span className="text-xs text-gray-500 ml-2">
                              (filtered)
                            </span>
                          )}
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
            <DialogTitle>{modalMessage.title}</DialogTitle>
            <DialogDescription>{modalMessage.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowModal(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showSalesReportModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => {
            if (!isExporting) {
              setShowSalesReportModal(false);
              setSalesDateRange({});
              setSalesType("all");
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">Generate Sales Report</h2>
            <p className="text-sm text-gray-600 mb-4">
              Select a date range and type of sales to include in the report.
            </p>

            <div className="flex gap-4 mt-2">
              <DateRangeFilter onChange={(range) => setSalesDateRange(range)} />

              <Select value={salesType} onValueChange={setSalesType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select Sales Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="orderrequest">Request Order</SelectItem>
                  <SelectItem value="walkin">Walk In</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSalesReportModal(false);
                  setSalesDateRange({});
                  setSalesType("all");
                }}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSalesExport}
                disabled={isExporting}
                className="flex items-center gap-2 bg-buttonBgColor hover:bg-buttonHover"
              >
                {isExporting ? "Generating..." : "Generate Report"}
                <MdOutlineFileDownload
                  className={isExporting ? "animate-bounce" : ""}
                />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PageTableHeader;
