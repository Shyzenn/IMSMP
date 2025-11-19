"use client";

import AddButton from "./Button";
import React, { useState } from "react";
import type { WalkInOrder, ProductData } from "@/lib/interfaces";
import { Input } from "@/components/ui/input";
import { IoIosClose } from "react-icons/io";
import { Path, useFieldArray, useForm } from "react-hook-form";
import { TWalkInOrderSchema, WalkInOrderSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { capitalLetter } from "@/lib/utils";
import FormField from "./FormField";
import { walkInOrder } from "@/lib/action/add";
import CancelButton from "./CancelButton";
import { useModal } from "../hooks/useModal";
import { useProducts } from "../hooks/useProducts";
import { useProductDropdown } from "../hooks/useProductDropDown";
import { useProductForm } from "../hooks/useProductForm";
import { IoAddOutline } from "react-icons/io5";
import { IoIosWalk } from "react-icons/io";
import { LuPrinter } from "react-icons/lu";
import { useSession } from "next-auth/react";
import { handleWalkInPrint } from "@/lib/printUtlis";

const WalkInOrder = () => {
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { data: session } = useSession();

  const { isOpen, open, close } = useModal();
  const { products, fetchProducts } = useProducts();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
    control,
    setValue,
    watch,
    clearErrors,
  } = useForm<TWalkInOrderSchema>({
    resolver: zodResolver(WalkInOrderSchema),
    mode: "onChange",
    defaultValues: {
      customer_name: "",
      products: [{ productId: "", quantity: 0 }],
    },
  });

  const {
    dropdownIndex,
    filteredProducts,
    handleFocus,
    handleSelectProduct,
    handleInputChangeProduct,
    selectedQuantity,
    dropdownRefs,
  } = useProductDropdown<TWalkInOrderSchema>(products, setValue, clearErrors);

  const watchProducts = watch("products");

  const calculatedTotals = watchProducts.map((item) => {
    const matchedProduct = products.find(
      (p: ProductData) =>
        p.productName.toLowerCase() === item.productId.toLowerCase()
    );
    const price = matchedProduct ? Number(matchedProduct.price || 0) : 0;
    const quantity = item.quantity || 0;
    return price * quantity;
  });

  const isQuantityExceeded = watchProducts.some((product, index) => {
    const hasProductSelected =
      product.productId.trim() !== "" && selectedQuantity[index] !== undefined;

    return hasProductSelected && product.quantity > selectedQuantity[index];
  });

  const { fields, prepend, remove } = useFieldArray({
    control,
    name: "products",
  });

  const { handleSubmitWrapper } = useProductForm<TWalkInOrderSchema>(
    setError,
    () => {
      reset();
      close();
      fetchProducts();
    }
  );

  const onSubmit = async (data: TWalkInOrderSchema) => {
    const hasInvalidProduct = data.products.some((product, index) => {
      const exists = products.some(
        (p) =>
          p.productName.toLowerCase() === product.productId.trim().toLowerCase()
      );

      if (!exists) {
        setError(`products.${index}.productId` as Path<TWalkInOrderSchema>, {
          type: "manual",
          message: "Product does not exist",
        });
      }

      return !exists;
    });

    if (hasInvalidProduct) return;

    //  Open print window IMMEDIATELY (synchronously) to avoid popup blocker
    const printWindow = window.open("", "printReceipt", "width=400,height=600");

    if (!printWindow) {
      toast.error("Please allow popups for printing receipts");
      setIsSaving(false);
      setIsPrinting(false);
      return;
    }

    setIsPrinting(true);

    // Show loading message in print window
    printWindow.document.write(`
    <html>
      <head><title>Preparing Receipt...</title></head>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h2>Preparing your receipt...</h2>
        <p>Please wait</p>
      </body>
    </html>
  `);

    // Prepare order data with prices
    const enrichedProducts = data.products.map((product) => {
      const matchedProduct = products.find(
        (p: ProductData) =>
          p.productName.toLowerCase() === product.productId.toLowerCase()
      );
      return {
        ...product,
        price: matchedProduct ? Number(matchedProduct.price || 0) : 0,
      };
    });

    const selectedOrder: WalkInOrder = {
      id: Date.now(),
      customer: data.customer_name ?? "Unknown",
      quantity: enrichedProducts.reduce((sum, i) => sum + i.quantity, 0),
      price: enrichedProducts.reduce((sum, i) => sum + (i.price ?? 0), 0),
      total: enrichedProducts.reduce(
        (sum, i) => sum + i.quantity * (i.price ?? 0),
        0
      ),
      createdAt: new Date(),
      itemDetails: enrichedProducts.map((p) => ({
        productName: p.productId,
        quantity: p.quantity,
        price: p.price ?? 0,
      })),
      handledBy: String(session?.user?.username ?? "Unknown"),
    };

    // Populate print window with receipt (but don't save to DB yet)
    await handleWalkInPrint(selectedOrder, printWindow);

    // Set up event to save order and close modal ONLY after print is done
    printWindow.onafterprint = async () => {
      printWindow.close();
      setIsPrinting(false);
      setIsSaving(true);

      // NOW save the order to database FIRST
      await handleSubmitWrapper(async () => {
        await walkInOrder(data);
        return { success: true };
      });

      // THEN close modal and show success message
      reset();
      close();
      fetchProducts();
      setIsSaving(false);
      toast.success("Walk In Order Submitted successfully! 🎉", {
        duration: 10000,
      });
    };
  };
  return (
    <>
      <AddButton
        icon={<IoIosWalk />}
        label="Walk in Order"
        className="px-6 py-2 mr-8"
        onClick={open}
      />

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white w-full max-w-[600px] max-h-[95vh] rounded-md relative overflow-hidden">
            <p className="text-center font-semibold text-xl py-4">
              Walk In Order Form
            </p>

            <form className="pb-[70px] mt-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="overflow-y-auto max-h-[calc(95vh-150px)]">
                <div className="border-b-2 pb-8 px-8 flex flex-col gap-8">
                  <FormField label="Customer Name">
                    <Input
                      id="name"
                      placeholder="Customer Name (Optional)"
                      {...register("customer_name")}
                    />
                  </FormField>
                </div>
                <div className="ml-8 mt-4">
                  <button
                    type="button"
                    onClick={() => prepend({ productId: "", quantity: 0 })}
                    className={`px-8 py-2 rounded-md text-black flex items-center gap-2 ${
                      isQuantityExceeded
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-white border border-[#41b08d] hover:bg-[#41b08d] hover:text-white transition-all duration-300 ease-in-out "
                    }`}
                    disabled={isQuantityExceeded}
                  >
                    <IoAddOutline className="text-xl" /> Add Product
                  </button>
                </div>

                <div className="p-8 h-[10%]">
                  <div className="flex text-sm border-b pb-4 font-semibold w-full">
                    <div className="w-[40%] ">
                      <p>Product Name</p>
                    </div>
                    <div className="w-[60%] flex gap-[3.8rem]">
                      <p>Quantity</p>
                      <p>Price</p>
                      <p>Amount</p>
                    </div>
                  </div>

                  <ul className="flex flex-col gap-4 mt-4 relative w-full">
                    {fields.map((item, index) => (
                      <li
                        key={item.id}
                        className="items-center w-full relative"
                        ref={(el) => {
                          dropdownRefs.current[index] = el;
                        }}
                      >
                        <div className="flex w-full border-gray-300 border p-2 rounded-lg">
                          <div className="relative w-[40%]">
                            <Input
                              className={`w-auto ${
                                errors.products?.[index]?.productId
                                  ? "border-red-500 focus:ring-red-500"
                                  : ""
                              }`}
                              placeholder="Enter Product Name"
                              {...register(
                                `products.${index}.productId` as const,
                                { required: true }
                              )}
                              onFocus={() => {
                                handleFocus(index);
                                setHighlightedIndex(0);
                              }}
                              onChange={(e) => {
                                handleInputChangeProduct(index, e.target.value);
                                clearErrors(`products.${index}.productId`);
                                setHighlightedIndex(0);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "ArrowDown") {
                                  e.preventDefault();
                                  setHighlightedIndex((prev) => {
                                    const nextIndex =
                                      (prev === null ? 0 : prev + 1) %
                                      filteredProducts.length;
                                    return nextIndex;
                                  });
                                } else if (e.key === "ArrowUp") {
                                  e.preventDefault();
                                  setHighlightedIndex((prev) => {
                                    const nextIndex =
                                      prev === null || prev === 0
                                        ? filteredProducts.length - 1
                                        : prev - 1;
                                    return nextIndex;
                                  });
                                } else if (
                                  e.key === "Enter" &&
                                  highlightedIndex !== null
                                ) {
                                  const product =
                                    filteredProducts[highlightedIndex];
                                  if (product.quantity.toString() !== "0") {
                                    handleSelectProduct(
                                      index,
                                      product.productName
                                    );
                                  }
                                }
                              }}
                            />

                            {dropdownIndex === index &&
                              filteredProducts.length > 0 && (
                                <ul className="absolute bottom-full mb-2 z-20 w-[23.5rem] bg-white border border-gray-300 shadow-md rounded-md max-h-60 overflow-y-auto pt-1">
                                  {filteredProducts.map((product, i) => (
                                    <li
                                      key={product.id}
                                      className={`p-2 ${
                                        product.quantity.toString() === "0"
                                          ? "bg-red-100 text-gray-400 cursor-not-allowed"
                                          : "cursor-pointer hover:bg-gray-100"
                                      } ${
                                        highlightedIndex === i
                                          ? "border-2 "
                                          : ""
                                      }`}
                                      onMouseEnter={() =>
                                        setHighlightedIndex(i)
                                      }
                                      onClick={() => {
                                        if (
                                          product.quantity.toString() !== "0"
                                        ) {
                                          handleSelectProduct(
                                            index,
                                            product.productName
                                          );
                                        }
                                      }}
                                    >
                                      <p className="flex justify-between">
                                        {capitalLetter(product.productName)}
                                        <span className="text-sm">
                                          {product.quantity} item
                                          {product.quantity.toString() > "1"
                                            ? "s"
                                            : ""}{" "}
                                          left
                                        </span>
                                      </p>
                                    </li>
                                  ))}
                                </ul>
                              )}
                          </div>
                          <div className="w-[60%] flex justify-between">
                            <div className="flex flex-col">
                              <Input
                                className={`w-[5rem] ${
                                  errors.products?.[index]?.quantity
                                    ? "border-red-500"
                                    : ""
                                }`}
                                type="number"
                                min={1}
                                placeholder="Enter Quantity"
                                {...register(
                                  `products.${index}.quantity` as const,
                                  {
                                    valueAsNumber: true,
                                    required: true,
                                  }
                                )}
                                disabled={!watch(`products.${index}.productId`)}
                              />
                            </div>
                            <div>
                              <Input
                                className="cursor-default text-gray-500 w-[5.5rem] ml-3.5"
                                type="text"
                                placeholder="₱0.00"
                                value={(() => {
                                  const selectedProductId = watch(
                                    `products.${index}.productId`
                                  );
                                  if (!selectedProductId) return "";

                                  const matchedProduct = products.find(
                                    (p) =>
                                      p.productName.toLowerCase() ===
                                      selectedProductId.toLowerCase()
                                  );

                                  if (!matchedProduct) return "";

                                  return `₱${Number(
                                    matchedProduct.price
                                  ).toLocaleString("en-PH", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}`;
                                })()}
                                readOnly
                                disabled={!watch(`products.${index}.productId`)}
                              />
                            </div>
                            <div>
                              <Input
                                className="w-[6.5rem]"
                                value={`₱${
                                  calculatedTotals[index]?.toFixed(2) || "0.00"
                                }`}
                                readOnly
                              />
                            </div>
                          </div>
                        </div>

                        {fields.length > 1 && (
                          <button
                            className="cursor-pointer absolute -top-2 -right-2 rounded-full w-4 h-4 border border-red-500 items-center flex justify-center"
                            onClick={() => remove(index)}
                            type="button"
                          >
                            <IoIosClose className="text-2xl text-red-600 " />
                          </button>
                        )}

                        <div className="flex justify-between">
                          {errors.products?.[index]?.productId && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.products[index].productId?.message}
                            </p>
                          )}
                          {selectedQuantity[index] !== undefined &&
                            watchProducts?.[index]?.quantity >
                              selectedQuantity[index] && (
                              <p className="text-sm text-red-500 mt-1 text-center mr-3">
                                Exceeds available stock (
                                {selectedQuantity[index]} left)
                              </p>
                            )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex  bg-white border-t-2 p-4 absolute bottom-0 left-0 w-full justify-between items-center">
                <div className="font-semibold border p-2 rounded-md">
                  Total:{" "}
                  <span className="font-normal text-gray-800">
                    ₱
                    {calculatedTotals
                      .reduce((sum, val) => sum + val, 0)
                      .toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </span>
                </div>

                <div className="flex gap-6">
                  <CancelButton setIsModalOpen={close} reset={reset} />
                  <button
                    type="submit"
                    className={`px-8 py-2 rounded-md text-white ${
                      isQuantityExceeded ||
                      isSubmitting ||
                      isSaving ||
                      isPrinting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#2b9e78] hover:bg-[#41b08d] transition-all duration-300 ease-in-out"
                    }`}
                    disabled={
                      isQuantityExceeded ||
                      isSubmitting ||
                      isSaving ||
                      isPrinting
                    }
                  >
                    {isPrinting ? (
                      <div className="flex items-center gap-2">Printing...</div>
                    ) : isSaving ? (
                      <div className="flex items-center gap-2">Saving...</div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <LuPrinter /> <p>Print</p>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default WalkInOrder;
