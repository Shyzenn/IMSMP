"use client";

import React, { useMemo, useState } from "react";
import TableComponent from "./TableComponent";
import { Order } from "@/lib/interfaces";
import { Input } from "@/components/ui/input";
import { IoIosClose } from "react-icons/io";
import { Path, useFieldArray, useForm } from "react-hook-form";
import { addRequestOrderSchema, TAddRequestOrderSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import LoadingButton from "@/components/loading-button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { capitalLetter, formattedDate } from "@/lib/utils";
import OrderDetailsModal from "./OrderDetailsModal";
import FormField from "./FormField";
import { baseColumns, fetchOrderRequest } from "./PharmacistRecentReqTable";
import { addRequesOrder } from "@/lib/action/add";
import CancelButton from "./CancelButton";
import { useModal } from "../hooks/useModal";
import { useProducts } from "../hooks/useProducts";
import { useProductDropdown } from "../hooks/useProductDropDown";
import { useProductForm } from "../hooks/useProductForm";

const RecentRequestOrder = () => {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

  const { isOpen, open, close } = useModal();
  const { products } = useProducts();

  const {
    data: orderRequest = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["request_order"],
    queryFn: fetchOrderRequest,
  });

  const formattedData = useMemo(
    () =>
      orderRequest.map((order) => ({
        ...order,
        createdAt: formattedDate(order.createdAt),
      })),
    [orderRequest]
  );

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
  } = useForm<TAddRequestOrderSchema>({
    resolver: zodResolver(addRequestOrderSchema),
    mode: "onChange",
    defaultValues: {
      room_number: "",
      patient_name: "",
      status: "pending",
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
  } = useProductDropdown<TAddRequestOrderSchema>(
    products,
    setValue,
    clearErrors
  );

  const watchProducts = watch("products");

  const isQuantityExceeded = watchProducts.some((product, index) => {
    const hasProductSelected =
      product.productId.trim() !== "" && selectedQuantity[index] !== undefined;

    return hasProductSelected && product.quantity > selectedQuantity[index];
  });

  const { fields, prepend, remove } = useFieldArray({
    control,
    name: "products",
  });

  const notify = () =>
    toast.success("Request Order Submitted successfully! 🎉", {
      icon: "✅",
    });

  const queryClient = useQueryClient();

  const { handleSubmitWrapper } = useProductForm<TAddRequestOrderSchema>(
    setError,
    () => {
      reset();
      notify();
      close();
      queryClient.invalidateQueries({ queryKey: ["request_order"] });
    }
  );

  const onSubmit = (data: TAddRequestOrderSchema) => {
    const hasInvalidProduct = data.products.some((product, index) => {
      const exists = products.some(
        (p) =>
          p.productName.toLowerCase() === product.productId.trim().toLowerCase()
      );

      if (!exists) {
        setError(
          `products.${index}.productId` as Path<TAddRequestOrderSchema>,
          {
            type: "manual",
            message: "Product does not exist",
          }
        );
      }

      return !exists;
    });

    if (hasInvalidProduct) return;

    handleSubmitWrapper(() => addRequesOrder(data));
  };

  if (isLoading) return <p>Loading products...</p>;
  if (isError) return <p>Failed to load products.</p>;

  return (
    <>
      <div className="mx-4 max-h-[320px] overflow-auto">
        <TableComponent
          requestOrderBtn={
            <button
              onClick={open}
              className="px-8 py-2 rounded-md text-white bg-green-500 hover:bg-green-600"
            >
              Request Order
            </button>
          }
          title="Recent Request Order"
          data={formattedData}
          columns={baseColumns}
          setIsOrderModalOpen={setIsOrderModalOpen}
          onRowClick={(row) => setSelectedOrder(row)}
          interactiveRows={true}
          noDataMessage={
            orderRequest.length === 0 ? "No Recent Order" : undefined
          }
        />
      </div>

      <OrderDetailsModal
        isOrderModalOpen={isOrderModalOpen}
        selectedOrder={selectedOrder}
        hasPrint={false}
        setIsOrderModalOpen={setIsOrderModalOpen}
      />

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white w-full max-w-[500px] max-h-[95vh] rounded-md relative overflow-hidden">
            <p className="text-center font-semibold text-xl py-4">
              Request Order Form
            </p>

            <form className="pb-[70px] mt-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="overflow-y-auto max-h-[calc(95vh-150px)]">
                <div className="border-b-2 pb-8 px-8 flex flex-col gap-8">
                  <FormField label="Room#">
                    <Input
                      id="room#"
                      placeholder="room number"
                      {...register("room_number")}
                    />
                  </FormField>

                  <FormField label="Patient Name">
                    <Input
                      id="name"
                      placeholder="patient name"
                      {...register("patient_name")}
                    />
                  </FormField>
                </div>

                <div className="p-8 h-[10%]">
                  <button
                    type="button"
                    onClick={() =>
                      prepend({
                        productId: "",
                        quantity: 0,
                      })
                    }
                    className={`px-8 py-2 rounded-md text-white ${
                      isQuantityExceeded
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                    disabled={isQuantityExceeded}
                  >
                    Add Product
                  </button>
                  <div className="flex justify-between text-sm mt-8 mr-[118px]">
                    <p>Product Name</p>
                    <p>Quantity</p>
                  </div>

                  <ul className="flex flex-col gap-4 mt-4 relative w-full">
                    {fields.map((item, index) => (
                      <li
                        key={item.id}
                        className="items-center w-full"
                        ref={(el) => {
                          dropdownRefs.current[index] = el;
                        }}
                      >
                        <div className="flex gap-8 w-full">
                          <div className="relative w-[53%]">
                            <Input
                              className={`w-full ${
                                errors.products?.[index]?.productId
                                  ? "border-red-500 focus:ring-red-500"
                                  : ""
                              }`}
                              placeholder="enter product name"
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
                                <ul className="absolute bottom-full mb-2 z-20 w-full bg-white border border-gray-300 shadow-md rounded-md max-h-60 overflow-y-auto">
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
                          <div className="flex flex-col w-[37%]">
                            <Input
                              className={`w-full ${
                                errors.products?.[index]?.quantity
                                  ? "border-red-500"
                                  : ""
                              }`}
                              type="number"
                              placeholder="enter quantity"
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
                          {fields.length > 1 && (
                            <IoIosClose
                              className="text-2xl text-red-600 cursor-pointer"
                              onClick={() => remove(index)}
                            />
                          )}
                        </div>
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

              <div className="flex gap-6 bg-white border-t-2 p-4 absolute bottom-0 left-0 w-full justify-end">
                <CancelButton setIsModalOpen={close} reset={reset} />
                <button
                  type="submit"
                  className={`px-8 py-2 rounded-md text-white ${
                    isQuantityExceeded || isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                  disabled={isQuantityExceeded || isSubmitting}
                >
                  {isSubmitting ? (
                    <LoadingButton color="text-white" />
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RecentRequestOrder;
