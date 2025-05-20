"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/app/components/Button";
import TableComponent from "./TableComponent";
import { Column } from "@/lib/interfaces";
import { Input } from "@/components/ui/input";
import AddButton from "@/app/components/Button";
import { FiPlus } from "react-icons/fi";
import { IoIosClose } from "react-icons/io";
import { useFieldArray, useForm } from "react-hook-form";
import { addRequestOrderSchema, TAddRequestOrderSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { addRequesOrder } from "@/lib/action";
import toast from "react-hot-toast";
import LoadingButton from "@/components/loading-button";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { OrderItem } from "@prisma/client";
// import { v4 as uuidv4 } from "uuid";

const columns: Column[] = [
  { label: "Order ID", accessor: "id" },
  { label: "Customer Name", accessor: "patient_name" },
  { label: "Date Placed", accessor: "createdAt" },
  { label: "Items", accessor: "items" },
  { label: "Status", accessor: "status", align: "right" },
];

export interface OrderRequestProps extends Record<string, unknown> {
  order_id: string;
  patient_name?: string;
  date: string;
  items: OrderItemProps[];
  status: string;
  createdAt: Date;
}

interface ProductData {
  id: string;
  productName: string;
  quantity: number;
}

interface OrderItemProps {
  id: string;
  quantity: number;
  productId: string;
  product: ProductData;
}

const fetchOrderRequest = async (): Promise<OrderRequestProps[]> => {
  const { data } = await axios.get("/api/request_order");
  return Array.isArray(data) ? data : [];
};

const RecentRequestOrder = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductData[]>([]);
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
  const dropdownRefs = useRef<(HTMLLIElement | null)[]>([]);

  const {
    data: orderRequest = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["request_order"],
    queryFn: fetchOrderRequest,
  });

  const formattedData = orderRequest.map((order) => ({
    ...order,
    createdAt: new Date(order.createdAt).toLocaleDateString(),
    items:
      order.items?.map((item) => ` (x${item.quantity})`).join(", ") ??
      "No items",
  }));

  const handleFocus = (index: number) => {
    const top10 = products.slice(0, 10);
    setFilteredProducts(top10);
    setDropdownIndex(index);
  };

  const handleSelectProduct = (index: number, productName: string) => {
    setValue(`products.${index}.productId`, productName);
    setDropdownIndex(null);
  };

  const handleProductInputChange = (index: number, value: string) => {
    setValue(`products.${index}.productId`, value);
    setDropdownIndex(index);

    const top10 = products
      .filter((p) => p.productName.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 10);
    setFilteredProducts(top10);
  };

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch("/api/product");
      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setProducts(
          data.map((product) => ({
            id: product.id,
            productName: product.product_name,
            quantity: product.quantity.toString(),
            price: product.price,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); // only runs when needed

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
  } = useForm<TAddRequestOrderSchema>({
    resolver: zodResolver(addRequestOrderSchema),
    defaultValues: {
      room_number: "",
      patient_name: "",
      status: "pending",
      products: [{ productId: "", quantity: 0 }],
    },
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
    try {
      console.log("Submitting data:", data);
      const responseData = await addRequesOrder(data);

      if (responseData.errors) {
        handleErrors(responseData.errors);
      } else if (responseData.success) {
        reset();
        notify();
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
          <TableComponent data={formattedData} columns={columns} />
        )}
      </div>

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
                  <AddButton
                    onClick={() =>
                      prepend({
                        productId: "",
                        quantity: 0,
                      })
                    }
                    label="Add Product"
                    icon={<FiPlus />}
                    type="button"
                  />
                  <div className="flex justify-between text-sm mt-8 mr-[118px]">
                    <p>Product Name</p>
                    <p>Quantity</p>
                  </div>

                  <ul className="flex flex-col gap-4 mt-4 relative w-full">
                    {fields.map((item, index) => (
                      <li
                        key={item.id}
                        className="flex gap-8 items-center w-full"
                        ref={(el) => {
                          dropdownRefs.current[index] = el;
                        }}
                      >
                        <div className="relative w-[60%]">
                          <Input
                            placeholder="enter product name"
                            {...register(
                              `products.${index}.productId` as const,
                              {
                                required: true,
                              }
                            )}
                            onChange={(e) =>
                              handleProductInputChange(index, e.target.value)
                            }
                            onFocus={() => handleFocus(index)}
                          />
                          {errors.products?.[index]?.productId && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.products[index]?.productId?.message}
                            </p>
                          )}

                          {dropdownIndex === index &&
                            filteredProducts.length > 0 && (
                              <ul className="absolute bottom-full mb-2 z-20 w-full bg-white border border-gray-300 shadow-md rounded-md max-h-60 overflow-y-auto">
                                {filteredProducts.map((product) => (
                                  <li
                                    key={product.id}
                                    onClick={() =>
                                      handleSelectProduct(
                                        index,
                                        product.productName
                                      )
                                    }
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                  >
                                    {product.productName}
                                  </li>
                                ))}
                              </ul>
                            )}
                        </div>
                        <div className="flex flex-col w-[30%]">
                          <Input
                            className="w-full"
                            type="number"
                            placeholder="enter quantity"
                            {...register(
                              `products.${index}.quantity` as const,
                              {
                                valueAsNumber: true,
                                required: true,
                              }
                            )}
                          />
                          {errors.products?.[index]?.quantity && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.products[index]?.quantity?.message}
                            </p>
                          )}
                        </div>
                        {fields.length > 1 && (
                          <IoIosClose
                            className="text-2xl text-red-600 cursor-pointer"
                            onClick={() => remove(index)}
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-6 bg-white border-t-2 p-4 absolute bottom-0 left-0 w-full justify-end">
                <button
                  type="button"
                  className="border px-6 py-2 rounded-md hover:bg-gray-50"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-8 py-2 rounded-md"
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
