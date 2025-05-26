"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Button from "@/app/components/Button";
import TableComponent from "./TableComponent";
import { Order, ProductData } from "@/lib/interfaces";
import { Input } from "@/components/ui/input";
import { IoIosClose } from "react-icons/io";
import { useFieldArray, useForm } from "react-hook-form";
import { addRequestOrderSchema, TAddRequestOrderSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { addRequesOrder } from "@/lib/action";
import toast from "react-hot-toast";
import LoadingButton from "@/components/loading-button";
import { useQuery } from "@tanstack/react-query";
import {
  capitalLetter,
  columns,
  fetchOrderRequest,
  formattedDate,
} from "@/lib/utils";
import OrderDetailsModal from "./OrderDetailsModal";

const RecentRequestOrder = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductData[]>([]);
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
  const dropdownRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const [selectedQuantity, setSelectedQuantity] = useState<
    Record<number, number>
  >({});

  const {
    data: orderRequest = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["request_order"],
    queryFn: fetchOrderRequest,
    refetchInterval: isModalOpen ? false : 5000,
  });

  const formattedData = useMemo(
    () =>
      orderRequest.map((order) => ({
        ...order,
        createdAt: formattedDate(order.createdAt),
      })),
    [orderRequest]
  );

  const handleFocus = (index: number) => {
    const top10 = products.slice(0, 10);
    setFilteredProducts(top10);
    setDropdownIndex(index);
  };

  const handleSelectProduct = (index: number, productName: string) => {
    setValue(`products.${index}.productId`, capitalLetter(productName));
    setDropdownIndex(null);

    const selectedProduct = products.find(
      (p) => capitalLetter(p.productName) === capitalLetter(productName)
    );

    if (selectedProduct) {
      setSelectedQuantity((prev) => ({
        ...prev,
        [index]: Number(selectedProduct.quantity),
      }));
    }
  };

  const handleInputChangeProduct = (index: number, value: string) => {
    const top10 = products.filter((product) =>
      product.productName.toLowerCase().includes(value.toLowerCase())
    );
    setValue(`products.${index}.productId`, value);
    setDropdownIndex(index);
    setFilteredProducts(top10);
  };

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch("api/product");
      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setProducts(
          data.map((product) => ({
            id: product.id,
            productName: product.product_name,
            quantity: product.quantity.toString(),
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching products", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownIndex !== null &&
        dropdownRefs.current[dropdownIndex] &&
        !dropdownRefs.current[dropdownIndex]?.contains(event.target as Node)
      ) {
        setDropdownIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownIndex]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
    control,
    setValue,
    watch,
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

  const handleErrors = (errors: Record<string, string>) => {
    Object.keys(errors).forEach((field) => {
      setError(field as keyof TAddRequestOrderSchema, {
        type: "server",
        message: errors[field],
      });
    });
  };

  const notify = () =>
    toast.success("Request Order Submitted successfully! 🎉", {
      icon: "✅",
    });

  const onSubmit = async (data: TAddRequestOrderSchema) => {
    let hasInvalidProduct = false;

    data.products.forEach((product, index) => {
      const exists = products.some(
        (p) =>
          capitalLetter(p.productName) ===
          capitalLetter(product.productId.trim())
      );
      if (!exists) {
        setError(`products.${index}.productId`, {
          type: "manual",
          message: "Product does not exist",
        });
        hasInvalidProduct = true;
      }
    });

    if (hasInvalidProduct) {
      return; // Don't submit
    }

    try {
      console.log("Submitting data:", data);
      const responseData = await addRequesOrder(data);

      if (responseData.errors) {
        handleErrors(responseData.errors);
      } else if (responseData.success) {
        reset();
        notify();
        setIsModalOpen(false);
      }
    } catch (error) {
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.errors) {
            handleErrors(errorData.errors);
          } else {
            alert("An unexpected error occurred.");
          }
        } catch {
          alert("An unexpected error occurred.");
        }
      } else {
        alert("An unexpected error occurred.");
      }
    }
    console.log("Form Data:", data);
  };

  if (isLoading) return <p>Loading products...</p>;
  if (isError) return <p>Failed to load products.</p>;

  return (
    <>
      <div className="flex justify-between p-5">
        <p className="text-lg font-semibold">Recent Request Order</p>
        <Button label="Request Order" onClick={() => setIsModalOpen(true)} />
      </div>

      <div className="mx-4 max-h-[220px] overflow-auto">
        {orderRequest.length === 0 ? (
          <p>No Request Order</p>
        ) : (
          <TableComponent
            data={formattedData}
            columns={columns}
            setIsOrderModalOpen={setIsOrderModalOpen}
            onRowClick={(row) => setSelectedOrder(row)}
          />
        )}
      </div>

      <OrderDetailsModal
        isOrderModalOpen={isOrderModalOpen}
        selectedOrder={selectedOrder}
        setIsOrderModalOpen={setIsOrderModalOpen}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white w-full max-w-[500px] max-h-[95vh] rounded-md relative overflow-hidden">
            <p className="text-center font-semibold text-xl py-4">
              Request Order Form
            </p>

            <form className="pb-[70px] mt-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="overflow-y-auto max-h-[calc(95vh-150px)]">
                <div className="border-b-2 pb-8 px-8">
                  <div className="mb-8 flex flex-col gap-2">
                    <label htmlFor="room#" className="text-sm">
                      Room #
                    </label>
                    <Input
                      id="room#"
                      placeholder="room number"
                      {...register("room_number")}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-sm">
                      Name
                    </label>
                    <Input
                      id="name"
                      placeholder="patient name"
                      {...register("patient_name")}
                    />
                  </div>
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
                <button
                  type="button"
                  className="border px-6 py-2 rounded-md hover:bg-gray-50"
                  onClick={() => {
                    setIsModalOpen(false);
                    reset();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-8 py-2 rounded-md text-white ${
                    isQuantityExceeded || isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                  disabled={isQuantityExceeded || isSubmitting}
                >
                  {isSubmitting ? <LoadingButton /> : "Submit"}
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
