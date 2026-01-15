import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { capitalLetter } from "@/lib/utils";
import { GoPlus } from "react-icons/go";
import { CiEdit, CiSearch } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import { useMemo, useState } from "react";
import { ProductCategory } from "@prisma/client";
import { ControllerRenderProps } from "react-hook-form";
import { TAddProductSchema } from "@/lib/types";
import LoadingButton from "@/components/loading-button";
import CancelButton from "../../ui/CancelButton";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { QueryObserverResult } from "@tanstack/react-query";
import { BsExclamationCircle } from "react-icons/bs";
import { BsExclamationTriangle } from "react-icons/bs";
import { HiChevronUpDown } from "react-icons/hi2";
import { productService } from "@/services/product.service";

type CategoryDropdown = {
  field: ControllerRenderProps<TAddProductSchema, "category">;
  openCategoryModal: (
    mode: "add" | "edit" | "delete",
    categories?: ProductCategory
  ) => void;
  categories?: { id: number; name: string }[];
  modalMode: "add" | "edit" | "delete" | null;
  categoryName: string;
  selectedCategoryForEdit: ProductCategory | null;
  setCategoryName: React.Dispatch<React.SetStateAction<string>>;
  setModalMode: React.Dispatch<
    React.SetStateAction<"add" | "edit" | "delete" | null>
  >;
  setSelectedCategoryForEdit: React.Dispatch<
    React.SetStateAction<ProductCategory | null>
  >;
  refetch: () => Promise<
    QueryObserverResult<{ id: number; name: string }[], Error>
  >;
};

const CategoryDropdown: React.FC<CategoryDropdown> = ({
  field,
  openCategoryModal,
  categories,
  modalMode,
  categoryName,
  selectedCategoryForEdit,
  setCategoryName,
  setModalMode,
  setSelectedCategoryForEdit,
  refetch,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isProcessingCategory, setIsProcessingCategory] = useState(false);
  const [showDependencyModal, setShowDependencyModal] = useState(false);
  const [productsInCategory, setProductsInCategory] = useState<
    { id: number; product_name: string }[]
  >([]);
  const [isCheckingDependencies, setIsCheckingDependencies] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const closeCategoryModal = () => {
    setModalMode(null);
    setSelectedCategoryForEdit(null);
    setCategoryName("");
    setCategoryError("");
    setSearchQuery("");
  };

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!searchQuery.trim()) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const handleCategoryAction = async () => {
    if (!categoryName.trim() && modalMode !== "delete") return;

    try {
      setIsProcessingCategory(true);

      if (modalMode === "add") {
        await productService.addCategory(categoryName);
        refetch();
        closeCategoryModal();
        toast.success("Category added!");
      } else if (modalMode === "edit" && selectedCategoryForEdit) {
        await productService.editCategory(
          selectedCategoryForEdit,
          categoryName
        );
        refetch();
        closeCategoryModal();
        toast.success("Category updated!");
      } else if (modalMode === "delete" && selectedCategoryForEdit) {
        const res = await fetch(
          `/api/product/category/${selectedCategoryForEdit.id}/delete`,
          { method: "DELETE" }
        );

        const data = await res.json();

        if (!res.ok) {
          if (data.hasProducts) {
            setProductsInCategory(data.products);
            setShowDependencyModal(true);
            return;
          }

          toast.error(data.error || "Failed to delete category.");
          return;
        }

        toast.success("Category deleted!");
        refetch();
        closeCategoryModal();
      }
    } catch (error) {
      if (error instanceof Error) {
        setCategoryError(error.message);
      } else {
        setCategoryError("Action failed. Please try again.");
      }
    } finally {
      setIsProcessingCategory(false);
    }
  };

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full border rounded-md py-[6.5px] shadow-sm text-left pl-3 text-sm hover:bg-gray-50"
          >
            <p className="text-gray-500 flex items-center justify-between">
              {field.value ? (
                <span className="text-gray-950">
                  {capitalLetter(field.value)}
                </span>
              ) : (
                <> Select a category </>
              )}
              <span>
                <HiChevronUpDown className="text-xl mr-2 text-gray-400" />
              </span>
            </p>
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-[15rem] max-h-80 overflow-y-auto p-0">
          <div className="flex w-full flex-col px-2 items-center border-b sticky top-0 bg-white py-2 gap-2">
            <div className="flex justify-between w-full">
              <p className="font-semibold text-sm pl-2">
                Categories ({categories?.length})
              </p>
              <button
                type="button"
                onClick={() => {
                  openCategoryModal("add");
                  setIsPopoverOpen(false);
                }}
                className="text-sm bg-buttonBgColor hover:bg-buttonHover text-white py-1 px-4 rounded-sm flex items-center gap-2 duration-300 ease-in-out"
              >
                <GoPlus /> Add
              </button>
            </div>

            <div className="w-full border px-4 rounded-md flex items-center gap-2">
              <CiSearch className="text-xl text-gray-800 font-bold" />
              <input
                placeholder="Search categories..."
                className="w-full py-1 outline-none text-sm pl-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {filteredCategories && filteredCategories.length > 0 ? (
            <>
              {filteredCategories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between px-2 text-[13px] gap-4"
                >
                  <button
                    className="flex-1 select-none hover:bg-gray-100 py-2 pl-2 rounded-sm text-start cursor-default"
                    type="button"
                    onClick={() => {
                      field.onChange(c.name);
                      setIsPopoverOpen(false);
                    }}
                  >
                    {capitalLetter(c.name)}
                  </button>
                  <div className="flex gap-2">
                    <button
                      className="border rounded-sm p-[1.5px] items-center hover:bg-gray-100"
                      type="button"
                      onClick={() => {
                        openCategoryModal("edit", c);
                        setIsPopoverOpen(false);
                      }}
                    >
                      <CiEdit className="text-lg" />
                    </button>
                    <button
                      type="button"
                      className="border rounded-sm px-1 items-center hover:bg-gray-100"
                      onClick={async () => {
                        setIsPopoverOpen(false);
                        setShowDependencyModal(true);
                        setIsCheckingDependencies(true);
                        setProductsInCategory([]);

                        try {
                          const res = await fetch(
                            `/api/product/category/${c.id}/check-products`
                          );
                          const data = await res.json();

                          if (!res.ok)
                            throw new Error(
                              "Failed to check category dependencies"
                            );

                          await new Promise((resolve) =>
                            setTimeout(resolve, 2000)
                          );

                          if (data.hasProducts) {
                            setProductsInCategory(data.products);
                          } else {
                            setShowDependencyModal(false);
                            openCategoryModal("delete", c);
                          }
                        } catch (error) {
                          console.error(error);
                          toast.error(
                            "Something went wrong while checking category."
                          );
                          setShowDependencyModal(false);
                        } finally {
                          setIsCheckingDependencies(false);
                        }
                      }}
                    >
                      <GoTrash className="text-md text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="flex flex-col items-center text-gray-500 mt-3 mb-3">
              <p className="text-sm">No categories found</p>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Category Modal */}
      {modalMode && !showDependencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-[400px]">
            <h2 className="text-lg font-semibold mb-4 capitalize">
              {modalMode} Category
            </h2>

            {modalMode === "delete" ? (
              <p className="text-sm text-gray-700">
                Are you sure you want to delete{" "}
                <strong>{selectedCategoryForEdit?.name}</strong>?
              </p>
            ) : (
              <>
                {modalMode === "edit" && (
                  <p className="text-xs text-yellow-600 bg-yellow-50 border border-yellow-100 rounded p-2 mb-4 flex gap-1">
                    <BsExclamationTriangle className="text-lg" /> Renaming this
                    category will also update its category name on existing
                    products.
                  </p>
                )}
                <Input
                  className={
                    categoryError ? "border-red-500 focus:ring-red-500" : ""
                  }
                  value={categoryName}
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                    if (categoryError) setCategoryError(null);
                  }}
                  placeholder={
                    modalMode === "edit"
                      ? "Rename category"
                      : "Enter new category"
                  }
                />

                {categoryError && (
                  <p className="text-red-500 text-sm mt-1">{categoryError}</p>
                )}
              </>
            )}

            <div className="flex justify-end gap-4 mt-4">
              <CancelButton onClick={closeCategoryModal} />
              <button
                type="button"
                onClick={handleCategoryAction}
                disabled={
                  isProcessingCategory ||
                  (categoryName.trim().length < 3 && modalMode !== "delete")
                }
                className={`px-4 py-2 rounded-md text-white flex items-center justify-center ${
                  modalMode === "delete"
                    ? "bg-red-500 hover:bg-red-600"
                    : categoryName.trim().length < 3
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-buttonBgColor hover:bg-buttonHover"
                }`}
              >
                {isProcessingCategory ? (
                  <LoadingButton color="text-white" />
                ) : modalMode === "delete" ? (
                  "Delete"
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dependency Modal (independent) */}
      {showDependencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md w-[420px] p-6 shadow-lg">
            {isCheckingDependencies ? (
              <div className="flex flex-col items-center justify-center">
                <LoadingButton color="text-gray-700" />
                <p className="text-sm text-gray-600 mt-2">
                  Checking category dependencies...
                </p>
              </div>
            ) : productsInCategory.length > 0 ? (
              <>
                <h2 className="text-lg font-semibold mb-3 text-red-500 flex items-center gap-2">
                  <BsExclamationCircle className="text-2xl" />
                  Cannot Delete Category
                </h2>
                <p className="text-sm text-gray-700 mb-3">
                  This category is linked to the following products:
                </p>
                <ul className="max-h-40 overflow-y-auto mb-4 border rounded p-2 text-sm text-gray-600">
                  {productsInCategory.map((p) => (
                    <li key={p.id}>• {p.product_name}</li>
                  ))}
                </ul>
                <p className="text-xs text-yellow-600 bg-yellow-50 border border-yellow-100 rounded p-2 mb-4">
                  You can reassign or remove these products from this category
                  before deleting.
                </p>
                <div className="flex justify-end gap-3">
                  <CancelButton onClick={() => setShowDependencyModal(false)} />
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryDropdown;
