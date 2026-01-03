import React from "react";
import { ProductProps } from "./InventoryTable";
import { formatPackageType, toTitleCase } from "@/lib/utils";
import { IoClose } from "react-icons/io5";
import { FaCircleCheck } from "react-icons/fa6";
import { FaTimesCircle } from "react-icons/fa";
import AddButton from "../../ui/Button";

const ProductDetailsModal = ({
  open,
  product,
  setShowProductDetailsModal,
  setShowReplenishModal,
}: {
  product: ProductProps;
  open: () => void;
  setShowProductDetailsModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowReplenishModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const openEditProductModal = () => {
    open();
    setShowProductDetailsModal(false);
  };

  const productData = [
    {
      id: "section-product-info",
      section: "Product Information",
      left: [
        {
          id: "generic-name",
          label: "Generic Name",
          value: product.genericName ? toTitleCase(product.genericName) : "N/A",
        },
        {
          id: "category",
          label: "Category",
          value: product.category,
        },
        {
          id: "manufacturer",
          label: "Manufacturer",
          value: product.manufacturer || "N/A",
        },
        {
          id: "description",
          label: "Description",
          value: product.description || "N/A",
        },
      ],
      right: [
        {
          id: "strength",
          label: "Strength",
          value: product.strength ? product.strength : "N/A",
        },
        {
          id: "dosage-form",
          label: "Dosage Form",
          value: product.dosageForm
            ? formatPackageType(product.dosageForm)
            : "N/A",
        },
        {
          id: "prescription-required",
          label: "Prescription Required",
          value: product.requiresPrescription ? "Yes" : "No",
        },
        {
          id: "price",
          label: "Price",
          value: `₱${product.price}`,
        },
      ],
    },

    {
      id: "section-stock-info",
      section: "Stock Information",
      left: [
        {
          id: "low-stock-alert",
          label: "Low Stock Alert",
          value: product.minimumStockAlert,
          show: true,
        },
        {
          id: "total-quantity",
          label: `Total Quantity`,
          value: product.totalQuantity,
          show: true,
        },
      ].filter((item) => item.show !== false),

      right: [
        {
          id: "total-batches",
          label: "Total Batches",
          value: product.totalBatches,
          show: true,
        },
        {
          id: "expiring-soon-batches",
          label: "Expiring Soon Batches",
          value: product.expiringSoonCount,
          show: true,
        },
      ].filter((item) => item.show !== false),
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white w-full max-w-[600px] max-h-[95vh] rounded-md relative overflow-auto ">
        <div className="border-b px-4 sticky top-0 bg-white pt-4">
          {" "}
          <h2 className="text-xl font-bold flex flex-col">
            <span> {product.product_name}</span>
          </h2>
          <div className="flex items-center gap-4 mb-4 mt-2">
            <p className="text-[10.3px] font-normal text-gray-500">
              Product ID: #PRD-0{product.id}
            </p>

            <div
              className={`text-[10px] px-2 w-14 flex justify-center items-center rounded-lg ${
                product.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : product.status === "EXPIRING"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {product.status}
            </div>
          </div>
          <button
            className="absolute right-4 top-4 cursor-pointer"
            onClick={() => setShowProductDetailsModal(false)}
          >
            <IoClose className=" text-lg text-gray-600 " />
          </button>
        </div>
        <div className="px-4 w-full">
          {/* Product Information */}
          {productData.map((sections) => (
            <div key={sections.id}>
              <p className="uppercase text-gray-500 text-[11px] font-bold mt-4">
                {sections.section}
              </p>
              <div className="flex">
                <div className="border-b flex pb-6 justify-between mt-3 w-full">
                  <div className="flex flex-col gap-3 w-full">
                    {sections.left.map((item) => (
                      <p
                        key={item.id}
                        className="flex flex-col text-[10.3px] text-gray-500 font-semibold w-full text-start"
                      >
                        {item.label}
                        <span className="text-sm text-gray-900">
                          {item.value}
                        </span>
                      </p>
                    ))}
                  </div>
                </div>
                <div className="border-b flex pb-6 justify-between mt-3 w-full">
                  <div className="flex flex-col gap-3 w-full">
                    {sections.right.map((item) => (
                      <p
                        key={item.id}
                        className="flex flex-col text-[10.3px] text-gray-500 font-semibold w-full text-start"
                      >
                        {item.label}
                        <span className="text-sm text-gray-900 flex items-center gap-1">
                          {item.id === "prescription-required" ? (
                            item.value === "Yes" ? (
                              <>
                                <FaCircleCheck className="text-green-600" /> Yes
                              </>
                            ) : (
                              <>
                                <FaTimesCircle className="text-red-500" /> No
                              </>
                            )
                          ) : item.id === "partial-dispensing" ? (
                            item.value === "true" ? (
                              <>
                                <FaCircleCheck className="text-green-600" />{" "}
                                Allowed
                              </>
                            ) : (
                              <>
                                <FaTimesCircle className="text-red-500" /> Not
                                Allowed
                              </>
                            )
                          ) : (
                            <>{item.value}</>
                          )}
                        </span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-4 mt-6 mb-4">
            <button
              className="border px-4 py-2 rounded-md hover:bg-slate-50 transition-all duration-300 ease-in-out"
              onClick={() => {
                setShowProductDetailsModal(false);
                setShowReplenishModal(true);
              }}
            >
              Replenish Product
            </button>

            <AddButton
              label="Edit Product"
              className="px-6 py-2"
              onClick={openEditProductModal}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
