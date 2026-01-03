"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { IoIosClose } from "react-icons/io";
import LoadingButton from "@/components/loading-button";
import { useQueryClient } from "@tanstack/react-query";
import { addRequestOrderSchema, TAddRequestOrderSchema } from "@/lib/types";
import { addRequesOrder } from "@/lib/action/add";
import { Textarea } from "@/components/ui/textarea";
import { useProducts } from "@/app/hooks/useProducts";
import { useProductForm } from "@/app/hooks/useProductForm";
import FormField from "../ui/FormField";
import CancelButton from "../ui/CancelButton";
import { ProductData } from "@/lib/interfaces";
import { formatPackageType } from "@/lib/utils";
import { CiSearch } from "react-icons/ci";
import { FiPlusCircle } from "react-icons/fi";
import { RxDoubleArrowDown, RxDoubleArrowUp } from "react-icons/rx";
import ToolTip from "../ui/ToolTip";

interface Props {
  close: () => void;
}

export interface CartItem {
  id: number;
  product: ProductData;
  quantity: number;
  totalUnits: number;
}

const RequestOrderModal = ({ close }: Props) => {
  const { products } = useProducts();
  const queryClient = useQueryClient();
  const [patientSearchQuery, setPatientSearchQuery] = useState<string>("");
  const [searchSuggestions, setSearchSuggestions] = useState<
    { patientName: string; roomNumber: number | null }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(
    null
  );
  const [quantity, setQuantity] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<number[]>([]);
  const [showPatientInfo, setShowPatientInfo] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
    setValue,
    watch,
  } = useForm<TAddRequestOrderSchema>({
    resolver: zodResolver(addRequestOrderSchema),
    mode: "onChange",
    defaultValues: {
      roomNumber: undefined,
      patientName: "",
      status: "pending",
      products: [],
      type: "REGULAR",
    },
  });

  const { handleSubmitWrapper } = useProductForm<TAddRequestOrderSchema>(
    setError,
    () => {
      reset();
      setCartItems([]);
      toast.success("Request Order Submitted successfully! 🎉", {
        duration: 10000,
      });
      close();
      queryClient.invalidateQueries({ queryKey: ["request_order"] });
    }
  );

  // Filter products based on search
  const filteredProducts = products.filter(
    (p) =>
      (p.product_name ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (p.genericName ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchInput = async (value: string) => {
    setPatientSearchQuery(value);

    if (value.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/request_order/patient_name?q=${encodeURIComponent(value)}`
      );

      if (response.ok) {
        const data = await response.json();
        setSearchSuggestions(data.results || []);
        setShowSuggestions((data.results || []).length > 0);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleSelectSuggestion = (patient: {
    patientName: string;
    roomNumber: number | null;
    contactNumber?: string | null;
  }) => {
    setPatientSearchQuery(patient.patientName);
    setValue("patientName", patient.patientName);
    setValue("roomNumber", patient.roomNumber ? patient.roomNumber : undefined);
    setValue(
      "contactNumber",
      patient.contactNumber ? patient.contactNumber : undefined
    );
    setShowSuggestions(false);
  };

  const handleSelectProduct = (product: ProductData) => {
    setSelectedProduct(product);
    setSearchQuery("");
    setQuantity("");
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !quantity || parseFloat(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const qtyNum = parseFloat(quantity);
    const totalUnits = qtyNum;

    // Check stock
    if (totalUnits > selectedProduct.quantity) {
      toast.error(
        `Not enough stock! Only ${selectedProduct.quantity} available.`
      );
      return;
    }

    const newItem: CartItem = {
      id: Date.now(),
      product: selectedProduct,
      quantity: qtyNum,
      totalUnits,
    };

    setCartItems((prev) => [newItem, ...prev]);

    setRecentlyAdded((prev) => [...prev, newItem.id]);
    setTimeout(() => {
      setRecentlyAdded((prev) => prev.filter((id) => id !== newItem.id));
    }, 5000);

    setSelectedProduct(null);
    setQuantity("");
  };

  const handleRemoveFromCart = (itemId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".search-container")) {
        setShowSuggestions(false);
      }

      if (patientSearchQuery.trim() === "") {
        setSearchSuggestions([]);
        setValue("patientName", "");
      }
    };

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }

    return;
  }, [showSuggestions, patientSearchQuery, setValue]);

  const onSubmit = async (data: TAddRequestOrderSchema) => {
    if (cartItems.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    const productsData = cartItems.map((item) => ({
      productId: item.product.id,
      quantityOrdered: Number(item.totalUnits),
    }));

    const updatedData: TAddRequestOrderSchema = {
      ...data,
      products: productsData,
      status: data.type === "EMERGENCY" ? "for_payment" : "pending",
    };

    await handleSubmitWrapper(() => addRequesOrder(updatedData));
  };

  useEffect(() => {
    if (errors.patientName) {
      setShowPatientInfo(true);
    }
  }, [errors.patientName]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white w-full max-w-[600px] min-h-[95vh] max-h-[95vh] rounded-md relative overflow-hidden">
        <p
          className={`text-center font-semibold text-xl py-4 ${
            showPatientInfo ? "border-b" : ""
          }`}
        >
          Request Order Form
        </p>

        <form className="pb-[70px] mt-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="overflow-y-auto max-h-[calc(95vh-150px)]">
            <div
              className={`transition-all duration-500 overflow-hidden ${
                showPatientInfo
                  ? "max-h-[600px] opacity-100"
                  : "max-h-[20px] opacity-0"
              }`}
            >
              <div className="px-8 flex flex-col gap-4 pb-6">
                <p className="font-medium mb-3 flex items-center gap-2">
                  Patient Information
                </p>
                <div className="search-container">
                  <FormField label="Patient Full Name">
                    <Input
                      value={patientSearchQuery}
                      onFocus={() => {
                        if (searchSuggestions.length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                      placeholder="Enter Patient Name"
                      autoComplete="off"
                      {...register("patientName", {
                        onChange: (e) => {
                          handleSearchInput(e.target.value);
                        },
                      })}
                      className={`w-full rounded-full${
                        errors.patientName
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    />
                  </FormField>
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <ul className=" w-full max-w-full bg-white border rounded-md shadow-md mt-1">
                      {searchSuggestions.map((patient) => (
                        <li
                          key={patient.patientName}
                          onClick={() => handleSelectSuggestion(patient)}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                        >
                          <span>{patient.patientName}</span>
                          <span className="text-gray-500 text-sm">
                            {patient.roomNumber ? (
                              <>Room {patient.roomNumber}</>
                            ) : (
                              "Room not assigned"
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {errors.patientName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.patientName.message}
                    </p>
                  )}
                </div>

                <div className="w-full flex flex-col md:flex-row gap-4">
                  <FormField
                    label="Room Number (Optional)"
                    error={errors.roomNumber?.message}
                  >
                    <Input
                      type="number"
                      min={1}
                      max={1000}
                      autoComplete="off"
                      placeholder="e.g., 305"
                      {...register("roomNumber", {
                        valueAsNumber: true,
                        setValueAs: (v) => (v === "" ? undefined : parseInt(v)),
                      })}
                      className={`w-full rounded-full ${
                        errors.roomNumber
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    />
                  </FormField>

                  <FormField
                    label="Contact Number (Optional)"
                    error={errors.contactNumber?.message}
                  >
                    <Input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="09XXXXXXXXX"
                      {...register("contactNumber")}
                      className={`w-full rounded-full ${
                        errors.contactNumber
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    />
                  </FormField>
                </div>

                <div className="flex flex-col w-full">
                  <label className="text-sm font-medium mb-[3px] text-gray-700">
                    Request Type
                  </label>
                  <div className="relative flex bg-gray-100 p-1 rounded-full w-full">
                    <div
                      className={`absolute inset-y-1 left-1 w-1/2 bg-white rounded-full shadow transition-transform duration-300 ${
                        watch("type") === "REGULAR"
                          ? "translate-x-0"
                          : "translate-x-[96%]"
                      }`}
                    ></div>

                    <button
                      onClick={() => setValue("type", "REGULAR")}
                      className="relative w-1/2 text-sm py-1 z-10 transition-colors duration-300 text-green-900 font-medium"
                      type="button"
                    >
                      Regular
                    </button>

                    <button
                      onClick={() => setValue("type", "EMERGENCY")}
                      className="relative w-1/2 text-sm py-1 z-10 transition-colors duration-300 text-green-900 font-medium"
                      type="button"
                    >
                      Pay Later
                    </button>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-[3px] text-gray-700">
                    Message (Optional)
                  </label>
                  <Textarea
                    placeholder="Type your message here."
                    {...register("notes")}
                  />
                </div>
              </div>
            </div>

            {/* Product Search Section */}
            <div className="relative">
              <div className="px-8 py-4 border-t">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-50">
                  <ToolTip
                    isButton={true}
                    buttonClassName="text-green-600 hover:text-green-800 transition-all bg-white shadow-sm w-9 h-9 rounded-full border flex justify-center items-center"
                    onClick={() => setShowPatientInfo((prev) => !prev)}
                    label={
                      showPatientInfo ? (
                        <RxDoubleArrowUp />
                      ) : (
                        <RxDoubleArrowDown />
                      )
                    }
                    tooltip={`Click to ${
                      showPatientInfo ? "hide" : "show"
                    } patient information`}
                  />
                </div>
                <p className="font-medium mb-3">Search & Add Products</p>
                <div className="w-full border px-6 rounded-full flex items-center gap-2 bg-gray-50 mb-2">
                  <CiSearch className="text-xl text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by product name or generic name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border-none outline-none focus-visible:ring-0 focus-visible:outline-none"
                  />
                </div>
                {/* Product Dropdown */}
                {searchQuery && filteredProducts.length > 0 && (
                  <div className="border border-gray-200 rounded-lg divide-y max-h-[13rem] overflow-y-auto mb-4">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleSelectProduct(product)}
                        disabled={product.quantity === 0}
                        className={`
                      p-3 transition-colors w-full
                        ${
                          product.quantity === 0
                            ? "bg-red-50 cursor-not-allowed "
                            : "cursor-pointer hover:bg-gray-50 "
                        }
                        
                      `}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900 text-start">
                              {product.product_name}
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="text-xs text-gray-500 mt-1 flex flex-col">
                              {product.quantity > 0 ? (
                                <>Stock: {product.quantity} </>
                              ) : (
                                <span className="text-red-600 ml-2 font-medium">
                                  Out of Stock
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {/* Selected Product Panel */}
                {selectedProduct && (
                  <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {selectedProduct.product_name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {`${
                            selectedProduct.genericName
                              ? selectedProduct.genericName
                              : ""
                          } - ${
                            selectedProduct.strength
                              ? formatPackageType(selectedProduct.strength)
                              : ""
                          } ${
                            selectedProduct.dosageForm
                              ? formatPackageType(selectedProduct.dosageForm)
                              : ""
                          }`}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedProduct(null)}
                        className="text-gray-400 hover:text-gray-600"
                        type="button"
                      >
                        <IoIosClose className="text-2xl" />
                      </button>
                    </div>

                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Enter quantity"
                        className="bg-white"
                      />
                    </div>

                    <button
                      onClick={handleAddToCart}
                      type="button"
                      disabled={!quantity || parseFloat(quantity) <= 0}
                      className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <FiPlusCircle className="text-lg" />
                      Add to Cart
                    </button>
                  </div>
                )}
              </div>

              {/* Cart Items */}
              {cartItems.length > 0 && (
                <div className="px-8 py-4 ">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <span>Request List</span>
                    <span className="text-sm text-gray-500">
                      ({cartItems.length} items)
                    </span>
                  </h3>

                  <div className="rounded-lg flex flex-col gap-2">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className={`
                        p-3 flex justify-between items-start hover:bg-gray-50 border rounded-lg shadow-md
                        ${
                          recentlyAdded.includes(item.id)
                            ? "border border-green-400 animate-pulse rounded-md"
                            : ""
                        }
                      `}
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2 items-center">
                            <p className="font-medium text-gray-900">
                              {item.product.product_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {`${item.product.genericName ?? ""} ${
                                item.product.strength ?? ""
                              } ${
                                item.product.dosageForm
                                  ? formatPackageType(item.product.dosageForm)
                                  : ""
                              }`}
                            </p>
                            <p className="text-gray-500 text-sm">{`(${item.quantity} pcs)`}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            type="button"
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <IoIosClose className="text-2xl" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cartItems.length === 0 && !selectedProduct && !searchQuery && (
                <div className="px-8 py-12 text-center text-gray-400">
                  <p className="text-lg mb-1">No products added yet</p>
                  <p className="text-sm">Search and add products to start</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-6 bg-white border-t-2 p-4 absolute bottom-0 left-0 w-full justify-end">
            <CancelButton setIsModalOpen={close} reset={reset} />
            <button
              type="submit"
              className={`px-8 py-2 rounded-md text-white ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#2b9e78] hover:bg-[#41b08d] transition-all duration-300 ease-in-out"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? <LoadingButton color="text-white" /> : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestOrderModal;
