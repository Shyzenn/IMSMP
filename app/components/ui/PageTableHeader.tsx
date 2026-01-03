"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MdOutlineFileDownload } from "react-icons/md";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
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
import { CiSearch } from "react-icons/ci";
import { generateTransactionPDF } from "@/lib/reportUtils/transactionReport";

import { generateMedTechTransactionPDF } from "@/lib/reportUtils/medtechTransactionReport";
import Search from "./Search";
import ProductFilter from "../Inventory/products/ProductFilter";
import TransactionFilter from "../transaction/TransactionFilter";
import BatchFilter from "../Inventory/batches/BatchFilter";
import MTTransactionFilter from "../transaction/MTTransactionFilter";
import AuditFilter from "../auditLog/AuditFilter";
import { DateRangeFilter } from "./DateRangeFilter";
import AddProductForm from "../Inventory/products/AddProductform";
import { MultiSelect } from "./multi-select";
import ArchiveFilter from "../archive/ArchiveFilter";
import { Body } from "@/app/api/report/sales/route";

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
  isMTTransactionFilter?: boolean;
  medTechReport?: boolean;
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
  isMTTransactionFilter,
  medTechReport,
}) => {
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [modalMessage, setModalMessage] = useState({
    title: "No Data Found",
    description: "There are no data available for this report.",
  });
  const [showSalesReportModal, setShowSalesReportModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showMTTransactionModal, setShowMTTransactionModal] = useState(false);

  // Sales report state
  const [salesDateRange, setSalesDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});
  const [salesType, setSalesType] = useState<string>("all");

  // Transaction report state
  const [transactionStatuses, setTransactionStatuses] = useState<string[]>([]);
  const [transactionSources, setTransactionSources] = useState<string[]>([]);
  const [transactionDateRange, setTransactionDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});
  const [transactionSearchQuery, setTransactionSearchQuery] =
    useState<string>("");

  // MedTech Transaction report state
  const [medtechTransactionStatus, setMedtechTransactionStatus] = useState<
    string[]
  >([]);
  const [medtechTransactionRemarks, setMedtechTransactionRemarks] = useState<
    string[]
  >([]);
  const [medtechTransactionDateRange, setMedtechTransactionDateRange] =
    useState<{
      from?: Date;
      to?: Date;
    }>({});
  const [medtechTransactionSearchQuery, setMedtechTransactionSearchQuery] =
    useState<string>("");

  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showNoResult, setShowNoResult] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentFilter = searchParams.get("filter") || "all";
  const currentQuery = searchParams.get("query") || "";
  const currentStockFilter = searchParams.get("stockFilter") || "all";

  // Handle search input with debounce
  const handleSearchInput = async (value: string) => {
    setTransactionSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/report/search/name?q=${encodeURIComponent(value)}`
        );
        if (response.ok) {
          const data = await response.json();
          setSearchSuggestions(data.results || []);
          setShowSuggestions(data.results.length > 0);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  // Delay showing "No results found" by 300ms after search completes
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    if (
      transactionSearchQuery.length >= 2 &&
      !isSearching &&
      searchSuggestions.length === 0
    ) {
      timeout = setTimeout(() => {
        setShowNoResult(true);
      }, 300);
    } else {
      setShowNoResult(false);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [transactionSearchQuery, isSearching, searchSuggestions]);

  const handleSelectSuggestion = (name: string) => {
    setTransactionSearchQuery(name);
    setShowSuggestions(false);
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".search-container")) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }

    return;
  }, [showSuggestions]);

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

  const handleTransactionExport = async () => {
    setIsExporting(true);
    try {
      const payload: {
        from?: string;
        to?: string;
        query?: string;
        statuses?: string[];
        sources?: string[];
      } = {};

      if (transactionDateRange.from) {
        payload.from = format(transactionDateRange.from, "yyyy-MM-dd");
      }
      if (transactionDateRange.to) {
        payload.to = format(transactionDateRange.to, "yyyy-MM-dd");
      }
      if (transactionSearchQuery.trim()) {
        payload.query = transactionSearchQuery.trim();
      }
      if (transactionStatuses.length > 0) {
        payload.statuses = transactionStatuses;
      }
      if (transactionSources.length > 0) {
        payload.sources = transactionSources;
      }

      const response = await fetch("/api/report/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 404) {
        setModalMessage({
          title: "No Data Found",
          description: "There are no transactions for the selected criteria.",
        });
        setShowModal(true);
        setShowTransactionModal(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const data = await response.json();
      const username = session?.user?.username || "Unknown User";
      generateTransactionPDF(data.transactions, data.meta, username);

      setShowTransactionModal(false);
      setTransactionDateRange({});
      setTransactionSearchQuery("");
      setTransactionStatuses([]);
      setTransactionSources([]);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    } catch (error) {
      console.error("Export error:", error);
      setModalMessage({
        title: "Export Failed",
        description: "There was an error generating the PDF. Please try again.",
      });
      setShowModal(true);
      setShowTransactionModal(false);
    } finally {
      setIsExporting(false);
    }
  };

  const handleMTTransactionExport = async () => {
    setIsExporting(true);
    try {
      const payload: {
        from?: string;
        to?: string;
        query?: string;
        statuses?: string[];
      } = {};

      if (medtechTransactionDateRange.from) {
        payload.from = format(medtechTransactionDateRange.from, "yyyy-MM-dd");
      }
      if (medtechTransactionDateRange.to) {
        payload.to = format(medtechTransactionDateRange.to, "yyyy-MM-dd");
      }
      if (medtechTransactionSearchQuery.trim()) {
        payload.query = medtechTransactionSearchQuery.trim();
      }

      // Combine status and remarks into a single statuses array
      const combinedStatuses = [
        ...medtechTransactionStatus,
        ...medtechTransactionRemarks,
      ];

      if (combinedStatuses.length > 0) {
        payload.statuses = combinedStatuses;
      }

      const response = await fetch("/api/report/medtech_transaction", {
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
            "There are no MedTech transactions for the selected criteria.",
        });
        setShowModal(true);
        setShowMTTransactionModal(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const data = await response.json();
      const username = session?.user?.username || "Unknown User";

      generateMedTechTransactionPDF(data.transactions, data.meta, username);

      setShowMTTransactionModal(false);
      setMedtechTransactionDateRange({});
      setMedtechTransactionSearchQuery("");
      setMedtechTransactionStatus([]);
      setMedtechTransactionRemarks([]);
    } catch (error) {
      console.error("Export error:", error);
      setModalMessage({
        title: "Export Failed",
        description: "There was an error generating the PDF. Please try again.",
      });
      setShowModal(true);
      setShowMTTransactionModal(false);
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
      <div className="flex flex-col lg:flex-row gap-4 w-full md:justify-between mb-4">
        <div className="flex items-center gap-4 justify-center">
          <p className="text-2xl font-semibold ">{title}</p>
        </div>

        <div className="w-auto md:w-full lg:w-[15rem] xl:w-[30rem] border px-6 rounded-full flex items-center gap-2 bg-gray-50 ">
          <Search placeholder={searchPlaceholder} />
        </div>

        <div className="flex gap-4 flex-col md:flex-row md:items-center md:justify-center">
          <div className="flex flex-col gap-4 md:flex-row">
            {isProductFilter ? (
              <ProductFilter />
            ) : isTransactionFilter ? (
              <TransactionFilter />
            ) : isBatchFilter ? (
              <BatchFilter />
            ) : isArchiveFilter ? (
              <ArchiveFilter />
            ) : isMTTransactionFilter ? (
              <MTTransactionFilter />
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
                        className="flex items-center gap-2 py-[22px]"
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

            {medTechReport && (
              <Button
                className="bg-white border hover:bg-gray-100 text-gray-500 hover:text-black flex justify-between"
                onClick={() => setShowMTTransactionModal(true)}
              >
                PDF Export
              </Button>
            )}

            {transactionExport && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-white border hover:bg-gray-100 text-gray-500 hover:text-black flex justify-between">
                      PDF Export <MdOutlineKeyboardArrowDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => setShowSalesReportModal(true)}
                    >
                      Sales Report
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => setShowTransactionModal(true)}
                    >
                      Transaction Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
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

      {showTransactionModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => {
            if (!isExporting) {
              setShowTransactionModal(false);
              setTransactionDateRange({});
              setTransactionSearchQuery("");
              setTransactionStatuses([]);
              setTransactionSources([]);
              setSearchSuggestions([]);
              setShowSuggestions(false);
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">
              Generate Transaction Report
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Select a date range or search customer/patient name to include in
              the report.
            </p>

            <div className="flex gap-4 mt-2 flex-col">
              <div className="flex gap-4">
                <MultiSelect
                  options={[
                    { label: "Order Request", value: "order_request" },
                    { label: "Walk In", value: "walk_in" },
                  ]}
                  onValueChange={(selected) => setTransactionSources(selected)}
                  value={transactionSources}
                  placeholder="Select transaction types..."
                  hideSelectAll
                />
                <MultiSelect
                  options={[
                    { label: "Pending", value: "pending" },
                    { label: "For Payment", value: "for_payment" },
                    { label: "Paid", value: "paid" },
                    { label: "Canceled", value: "canceled" },
                    { label: "Refunded", value: "refunded" },
                  ]}
                  onValueChange={(selected) => setTransactionStatuses(selected)}
                  value={transactionStatuses}
                  placeholder="Select status filters..."
                  hideSelectAll
                />
              </div>

              <DateRangeFilter
                onChange={(range) => setTransactionDateRange(range)}
              />
              <div className="relative search-container">
                <div className="w-auto border px-4 rounded-md flex items-center gap-2">
                  <CiSearch className="text-xl text-gray-800 font-bold" />
                  <input
                    placeholder="Search customer/patient name..."
                    className="w-full py-2 outline-none text-sm pl-1"
                    value={transactionSearchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    onFocus={() => {
                      if (searchSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                  />
                  {isSearching && (
                    <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full" />
                  )}
                </div>

                {/* Dropdown suggestions */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {searchSuggestions.map((name, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm transition-colors"
                        onClick={() => handleSelectSuggestion(name)}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
                {showNoResult && (
                  <p className="text-sm text-gray-500 mt-1 italic">
                    No results found for{" "}
                    <span className="font-semibold">{`"${transactionSearchQuery}"`}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTransactionModal(false);
                  setTransactionDateRange({});
                  setTransactionSearchQuery("");
                  setTransactionStatuses([]);
                  setTransactionSources([]);
                  setSearchSuggestions([]);
                  setShowSuggestions(false);
                }}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleTransactionExport}
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

      {showMTTransactionModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => {
            if (!isExporting) {
              setShowMTTransactionModal(false);
              setMedtechTransactionDateRange({});
              setMedtechTransactionSearchQuery("");
              setMedtechTransactionStatus([]);
              setMedtechTransactionRemarks([]);
              setSearchSuggestions([]);
              setShowSuggestions(false);
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">
              Generate MedTech Transaction Report
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Select a date range, status, remarks or search to include in the
              report.
            </p>

            <div className="flex gap-4 mt-2 flex-col">
              <MultiSelect
                options={[
                  {
                    label: "Pending for Approval",
                    value: "pending_for_approval",
                  },
                  { label: "Approved", value: "approved" },
                  { label: "Declined", value: "declined" },
                ]}
                onValueChange={(selected) =>
                  setMedtechTransactionStatus(selected)
                }
                value={medtechTransactionStatus}
                placeholder="Select status..."
                hideSelectAll
              />

              <MultiSelect
                options={[
                  { label: "Processing", value: "processing" },
                  { label: "Ready", value: "ready" },
                  { label: "Released", value: "released" },
                ]}
                onValueChange={(selected) =>
                  setMedtechTransactionRemarks(selected)
                }
                value={medtechTransactionRemarks}
                placeholder="Select remarks..."
                hideSelectAll
              />

              <div className="flex justify-between">
                <DateRangeFilter
                  onChange={(range) => setMedtechTransactionDateRange(range)}
                />

                <div className="relative search-container">
                  <div className="w-[13rem] border px-4 rounded-md flex items-center gap-2">
                    <CiSearch className="text-xl text-gray-800 font-bold" />
                    <input
                      placeholder="Search by ID..."
                      className="w-full py-2 outline-none text-sm pl-1"
                      type="number"
                      min={0}
                      value={medtechTransactionSearchQuery}
                      onChange={(e) =>
                        setMedtechTransactionSearchQuery(e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Dropdown suggestions */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {searchSuggestions.map((name, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm transition-colors"
                        onClick={() => handleSelectSuggestion(name)}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
                {showNoResult && (
                  <p className="text-sm text-gray-500 mt-1 italic">
                    No results found for{" "}
                    <span className="font-semibold">{`"${medtechTransactionSearchQuery}"`}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMTTransactionModal(false);
                  setMedtechTransactionDateRange({});
                  setMedtechTransactionSearchQuery("");
                  setMedtechTransactionStatus([]);
                  setMedtechTransactionRemarks([]);
                  setSearchSuggestions([]);
                  setShowSuggestions(false);
                }}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleMTTransactionExport}
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
