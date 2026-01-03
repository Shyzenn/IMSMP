"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RiCloseFill } from "react-icons/ri";
import { FiPlus } from "react-icons/fi";
import { OrderProduct, RequestFormData } from "@/lib/interfaces";
import AddButton from "../ui/Button";

interface RequestFormProps {
  buttonLabel: string;
  onPrintClick?: () => void;
  onSubmitForm: (data: RequestFormData) => void;
}

const RequestForm: React.FC<RequestFormProps> = ({
  buttonLabel,
  onPrintClick,
  onSubmitForm,
}) => {
  const [roomNumber, setRoomNumber] = useState("");
  const [patientName, setPatientName] = useState("");
  const [inputs, setInputs] = useState<OrderProduct[]>([
    { id: 1, productName: "", quantity: "", price: 0 },
  ]);
  const [products, setProducts] = useState<OrderProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<OrderProduct[]>([]);
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);

  // Ref for tracking multiple dropdowns
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitForm({ roomNumber, patientName, products: inputs });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownIndex !== null &&
        dropdownRefs.current[dropdownIndex] &&
        !dropdownRefs.current[dropdownIndex]?.contains(event.target as Node)
      ) {
        setDropdownIndex(null); // Hide dropdown when clicking outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownIndex]);

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
  }, [fetchProducts]); // ✅ Now only runs when needed

  // Function to update input values
  const handleInputChange = (
    index: number,
    field: keyof OrderProduct,
    value: string
  ) => {
    setInputs((prevInputs) => {
      const updatedInputs = [...prevInputs];
      updatedInputs[index] = { ...updatedInputs[index], [field]: value || "" };

      if (field === "productName") {
        const matchedProducts = products.find(
          (product) => product.productName.toLowerCase() === value.toLowerCase()
        );

        if (matchedProducts) {
          updatedInputs[index].price = matchedProducts.price; // automatically assign price in the modal
        }
      }

      return updatedInputs;
    });

    if (field === "productName") {
      const filtered = products.filter((product) =>
        product.productName.toLowerCase().includes(value.toLowerCase())
      );

      setFilteredProducts(filtered);
      if (filteredProducts.length !== filtered.length) {
        setFilteredProducts(filtered);
      }

      if (filtered.length > 0 && dropdownIndex !== index) {
        setDropdownIndex(index);
      } else if (filtered.length === 0 && dropdownIndex !== null) {
        setDropdownIndex(null);
      }

      // Ensure dropdown opens even if no products match
      setDropdownIndex(index);
    }
  };

  // Function to show dropdown when input is focused
  const handleInputFocus = (index: number) => {
    setFilteredProducts(products); // Show all products initially
    setDropdownIndex(index);
  };

  // Function to select a product from dropdown
  const selectProduct = (index: number, productName: string) => {
    handleInputChange(index, "productName", productName);
    setFilteredProducts([]); // Clear dropdown
    setDropdownIndex(null); // Hide dropdown after selection
  };

  // Add a new product input
  const addProduct = () => {
    setInputs([
      ...inputs,
      { id: inputs.length + 1, productName: "", quantity: "", price: 0 },
    ]);
  };

  // Remove product input field
  const removeProduct = (id: number) => {
    setInputs(inputs.filter((input) => input.id !== id));
  };

  return (
    <form onSubmit={handleSubmit} className="h-full pt-6">
      <div className="flex justify-between w-full gap-60 h-[20%] border-b-2">
        <div className="flex flex-col w-full">
          <label>Room#</label>
          <input
            type="text"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            className="border w-full mt-5 rounded-md outline-none px-4 py-1"
            placeholder="Enter Room Number"
          />
        </div>
        <div className="flex flex-col w-full">
          <label>Patient Name</label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="border w-full mt-5 rounded-md outline-none px-4 py-1"
            placeholder="Enter Patient Name"
          />
        </div>
      </div>

      <div className="mt-10 h-[10%]">
        <AddButton
          onClick={addProduct}
          label="Add Product"
          icon={<FiPlus />}
          type="button"
        />
      </div>

      <div className="h-[50%] border-b-2">
        <div className="overflow-auto h-[18rem]">
          {inputs.map((input, index) => (
            <div
              key={input.id}
              className="flex justify-between w-full gap-5 mt-5"
            >
              {/* Product Name Input with Dropdown */}
              <div
                className="relative flex flex-col w-full"
                ref={(el) => {
                  if (el) dropdownRefs.current[index] = el;
                }}
              >
                <label>Product Name</label>
                <input
                  type="text"
                  value={input.productName || ""}
                  onChange={(e) =>
                    handleInputChange(index, "productName", e.target.value)
                  }
                  onFocus={() => handleInputFocus(index)}
                  className="border w-full mt-2 rounded-md outline-none px-4 py-1"
                  placeholder="Enter Product Name"
                />

                {/* Dropdown for product suggestions */}
                {dropdownIndex === index && (
                  <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 shadow-md rounded-md max-h-40 overflow-y-auto top-16">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <li
                          key={product.id}
                          onClick={() =>
                            selectProduct(index, product.productName)
                          }
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {product.productName}
                        </li>
                      ))
                    ) : (
                      <li className="p-2 text-gray-500 text-center">
                        No products found
                      </li>
                    )}
                  </ul>
                )}
              </div>

              {/* Quantity Input */}
              <div className="flex flex-col w-full">
                <label>Quantity</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={input.quantity}
                    onChange={(e) =>
                      handleInputChange(index, "quantity", e.target.value)
                    }
                    placeholder="Enter Quantity"
                    className="border w-full mt-2 rounded-md outline-none px-4 py-1"
                  />
                  <button type="button" onClick={() => removeProduct(input.id)}>
                    <RiCloseFill className="text-2xl text-red-600 cursor-pointer mt-2 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-[15%] flex justify-end items-center">
        <AddButton type="submit" onClick={onPrintClick} label={buttonLabel} />
      </div>
    </form>
  );
};

export default RequestForm;
