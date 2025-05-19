"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/app/components/Button";
import TableComponent from "./TableComponent";
import { Column } from "@/lib/interfaces";
import { Input } from "@/components/ui/input";
import AddButton from "@/app/components/Button";
import { FiPlus } from "react-icons/fi";
import { IoIosClose } from "react-icons/io";
import { v4 as uuidv4 } from "uuid";

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    items: "2",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    items: "2",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    items: "2",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    items: "2",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    items: "2",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    items: "2",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    items: "2",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
];

const columns: Column[] = [
  { label: "Order ID", accessor: "invoice" },
  { label: "Customer Name", accessor: "paymentStatus" },
  { label: "Date Placed", accessor: "paymentMethod" },
  { label: "Items", accessor: "items" },
  { label: "Status", accessor: "totalAmount", align: "right" },
];

interface ProductData {
  id: string;
  productName: string;
  quantity: number;
}

const RecentRequestOrder = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputs, setInputs] = useState<ProductData[]>([
    { id: uuidv4(), productName: "", quantity: 0 },
  ]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductData[]>([]);
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);

  const addProduct = () => {
    setInputs([...inputs, { id: uuidv4(), productName: "", quantity: 0 }]);
  };

  const deleteProduct = (id: string) => {
    setInputs(inputs.filter((input) => input.id !== id));
  };

  const handleQuantityChange = (index: number, value: number) => {
    setInputs((prev) => {
      const newInputs = [...prev];
      newInputs[index].quantity = value;
      return newInputs;
    });
  };

  const handleFocus = (index: number) => {
    const top10 = products.slice(0, 10);
    setFilteredProducts(top10);
    setDropdownIndex(index);
  };

  const handleSelectProduct = (index: number, productName: string) => {
    const updatedInputs = [...inputs];
    updatedInputs[index].productName = productName;
    setInputs(updatedInputs);
    setDropdownIndex(null);
  };

  const handleProductInputChange = (index: number, value: string) => {
    const updatedInputs = [...inputs];
    updatedInputs[index].productName = value;
    setInputs(updatedInputs);

    setDropdownIndex(index);
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

  return (
    <>
      <div className="flex justify-between p-5">
        <p className="text-lg font-semibold">Recent Request Order</p>
        <Button label="Request Order" onClick={() => setIsModalOpen(true)} />
      </div>

      <div className="mx-4 max-h-[220px] overflow-auto">
        <TableComponent data={invoices} columns={columns} />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white w-full max-w-[500px] max-h-[95vh] rounded-md relative overflow-hidden">
            <p className="text-center font-semibold text-xl py-4">
              Request Order Form
            </p>

            <form className="pb-[70px] mt-6">
              <div className="overflow-y-auto max-h-[calc(95vh-150px)]">
                <div className="border-b-2 pb-8 px-8">
                  <div className="mb-8 flex flex-col gap-2">
                    <label htmlFor="room#" className="text-sm">
                      Room #
                    </label>
                    <Input id="room#" placeholder="room number" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-sm">
                      Name
                    </label>
                    <Input id="name" placeholder="patient name" />
                  </div>
                </div>

                <div className="p-8 h-[10%]">
                  <AddButton
                    onClick={addProduct}
                    label="Add Product"
                    icon={<FiPlus />}
                    type="button"
                  />
                  <div className="flex justify-between text-sm mt-8 mr-[118px]">
                    <p>Product Name</p>
                    <p>Quantity</p>
                  </div>

                  {inputs.map((input, index) => (
                    <div
                      className="flex w-full gap-8 mt-4 relative"
                      key={input.id}
                      ref={(el) => {
                        dropdownRefs.current[index] = el;
                      }}
                    >
                      <div className="relative w-[60%]">
                        <Input
                          placeholder="enter product name"
                          value={input.productName}
                          onChange={(e) =>
                            handleProductInputChange(
                              inputs.indexOf(input),
                              e.target.value
                            )
                          }
                          onFocus={() => handleFocus(inputs.indexOf(input))}
                        />
                        {dropdownIndex === inputs.indexOf(input) &&
                          filteredProducts.length > 0 && (
                            <ul className="absolute bottom-full mb-2 z-20 w-full bg-white border border-gray-300 shadow-md rounded-md max-h-60 overflow-y-auto">
                              {filteredProducts.map((product) => (
                                <li
                                  key={product.id}
                                  onClick={() =>
                                    handleSelectProduct(
                                      inputs.indexOf(input),
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

                      <Input
                        className="w-[30%]"
                        type="number"
                        placeholder="enter quantity"
                        value={input.quantity === 0 ? "" : input.quantity}
                        onChange={(e) =>
                          handleQuantityChange(index, Number(e.target.value))
                        }
                      />

                      <div className="flex items-center">
                        <IoIosClose
                          className="text-2xl text-red-600 cursor-pointer"
                          onClick={() => deleteProduct(input.id)}
                        />
                      </div>
                    </div>
                  ))}
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
                  Confirm
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
