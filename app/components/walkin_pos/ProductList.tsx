"use client";

import { Input } from "@/components/ui/input";
import React, { useEffect, useRef, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMedicines } from "@/app/hooks/useMedicines";
import { ProductData } from "@/lib/interfaces";
import { BsCartPlus } from "react-icons/bs";
import { formatPackageType } from "@/lib/utils";
import { ProductListSkeleton } from "../ui/Skeleton";
import { CartItem } from "./WalkInPOS";
import { useDebounce } from "@/app/hooks/useDebounce";

const medicineFormTypes = [
  { label: "All Items", value: "all", type: "special" },
  { label: "Prescription", value: "true", type: "prescription" },
  { label: "OTC", value: "false", type: "prescription" },
  { label: "Capsule", value: "capsule", type: "form" },
  { label: "Tablet", value: "tablet", type: "form" },
  { label: "Caplet", value: "caplet", type: "form" },
  { label: "Softgel", value: "softgel", type: "form" },
  { label: "Powder", value: "powder", type: "form" },
  { label: "Solution", value: "solution", type: "form" },
  { label: "Suspension", value: "suspension", type: "form" },
  { label: "Syrup", value: "syrup", type: "form" },
  { label: "Injection", value: "injection", type: "form" },
  { label: "IV Solution", value: "iv_solution", type: "form" },
  { label: "Cream", value: "cream", type: "form" },
  { label: "Ointment", value: "ointment", type: "form" },
  { label: "Gel", value: "gel", type: "form" },
  { label: "Patch", value: "patch", type: "form" },
  { label: "Inhaler", value: "inhaler", type: "form" },
  { label: "Drops", value: "drops", type: "form" },
] as const;

const ProductList = ({
  onAddtoCart,
}: {
  onAddtoCart: (product: CartItem) => void;
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [requiresPrescription, setRequiresPrescription] = useState<
    boolean | null
  >(null);

  const debouncedSearchTerm = useDebounce(searchTerm);

  const scrollRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
  } = useMedicines({
    searchTerm: debouncedSearchTerm,
    selectedFilters,
    requiresPrescription,
  });

  const medicines = data?.pages.flatMap((page) => page.items) ?? [];

  const scroll = (direction: string) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  const handleFilterClick = (filter: { value: string; type: string }) => {
    if (filter.type === "special" && filter.value === "all") {
      // Reset all filters
      setSelectedFilters([]);
      setRequiresPrescription(null);
    } else if (filter.type === "prescription") {
      // Toggle prescription filter
      const newValue = filter.value === "true" ? true : false;
      setRequiresPrescription((prev) => (prev === newValue ? null : newValue));
    } else if (filter.type === "form") {
      setSelectedFilters((prev) => {
        if (prev.includes(filter.value)) {
          // Remove if already selected
          return prev.filter((f) => f !== filter.value);
        } else {
          // Add if not selected
          return [...prev, filter.value];
        }
      });
    }
  };

  const isFilterActive = (filter: { value: string; type: string }) => {
    if (filter.type === "special") {
      return selectedFilters.length === 0 && requiresPrescription === null;
    } else if (filter.type === "prescription") {
      const boolValue = filter.value === "true";
      return requiresPrescription === boolValue;
    } else if (filter.type === "form") {
      return selectedFilters.includes(filter.value);
    }
    return false;
  };

  useEffect(() => {
    const container = scrollRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { threshold: 0.5 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  return (
    <>
      {/* Search and Filtering */}
      <div className="h-full flex flex-col bg-slate-100">
        <div className="bg-white p-4 shrink-0">
          <div className="w-full border px-2 rounded-md flex items-center gap-1 bg-gray-50 mb-2">
            <CiSearch className="text-xl text-gray-400" />
            <Input
              type="text"
              placeholder="Search by product name or generic name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border-none outline-none focus-visible:ring-0 focus-visible:outline-none"
            />
          </div>

          {/* Carousel Container */}
          <div className="relative group">
            {/* Left Arrow */}
            {showLeftArrow && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-1.5 shadow-md hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Scrollable Filter Container */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {medicineFormTypes.map((filter) => (
                <button
                  key={filter.value}
                  className={`border px-4 py-2 text-xs whitespace-nowrap rounded-lg transition-colors flex-shrink-0 ${
                    isFilterActive(filter)
                      ? "bg-[#2b9e78] hover:bg-[#41b08d] text-white"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleFilterClick(filter)}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Right Arrow */}
            {showRightArrow && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-1.5 shadow-md hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Medicines List */}
        <div
          id="medicine-scroll"
          className="flex-1 overflow-y-auto scrollbar scrollbar-thin scrollbar-thumb p-4"
        >
          {isLoading ? (
            <ProductListSkeleton />
          ) : isError ? (
            <div className="p-4 text-red-500">
              <div className="p-4 text-red-500">
                Error:{" "}
                {error instanceof Error ? error.message : "Failed to load"}
              </div>
            </div>
          ) : medicines.length === 0 ? (
            <p className="text-gray-500 text-center p-4">No medicines found</p>
          ) : (
            medicines.map((med: ProductData) => {
              const totalQuantity =
                med.batches?.reduce((sum, item) => sum + item.quantity, 0) || 0;

              const outOfStock = totalQuantity === 0;
              const lowStock = totalQuantity <= Number(med.minimumStockAlert);

              return (
                <div
                  key={med.id}
                  className={`border p-4 mb-2 bg-white rounded-lg ${
                    outOfStock ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex justify-between items-center border-b pb-2">
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold">{med.product_name} </p>
                      <p className="text-sm text-gray-600">
                        {med.genericName}{" "}
                        <span>
                          {formatPackageType(
                            med.dosageForm ? med.dosageForm : ""
                          )}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold">
                        ₱{Number(med.price.toLocaleString()).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-600 text-end">per unit</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="uppercase text-gray-500 text-xs font-semibold">
                        Available Stock
                      </span>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 ${
                            outOfStock
                              ? "bg-red-500"
                              : lowStock
                              ? "bg-orange-500"
                              : "bg-green-500"
                          } rounded-full`}
                        />
                        <span
                          className={`text-sm font-semibold ${
                            outOfStock
                              ? "text-red-500"
                              : lowStock
                              ? "text-orange-500"
                              : ""
                          }`}
                        >
                          {outOfStock ? "Out of Stock" : totalQuantity}{" "}
                          {lowStock ? "(Low)" : ""}
                        </span>
                      </div>
                    </div>
                    <button
                      disabled={outOfStock}
                      onClick={() =>
                        onAddtoCart({
                          productId: med.id,
                          productName: med.product_name,
                          genericName: med.genericName ?? "",
                          strength: med.strength ?? "",
                          dosageForm: med.dosageForm ?? "",
                          quantity: med.quantity,
                          price: med.price,
                          stock: totalQuantity,
                        })
                      }
                      className={`  text-white px-8 py-2 flex items-center rounded-lg gap-2 ${
                        outOfStock
                          ? "bg-gray-300 cursor-default"
                          : "bg-buttonBgColor hover:bg-buttonHover"
                      }`}
                    >
                      Add to Cart
                      <BsCartPlus />
                    </button>
                  </div>
                </div>
              );
            })
          )}
          <div
            ref={loadMoreRef}
            className="h-8 flex justify-center items-center"
          >
            {isFetchingNextPage && <p>Loading more...</p>}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default ProductList;
