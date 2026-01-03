// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { Input } from "@/components/ui/input";
// import { IoIosClose } from "react-icons/io";
// import { useForm } from "react-hook-form";
// import { TWalkInOrderSchema, WalkInOrderSchema } from "@/lib/types";
// import { zodResolver } from "@hookform/resolvers/zod";
// import toast from "react-hot-toast";
// import { walkInOrder } from "@/lib/action/add";
// import { IoIosWalk } from "react-icons/io";
// import { LuPrinter } from "react-icons/lu";
// import { useSession } from "next-auth/react";
// import { handleWalkInPrint } from "@/lib/printUtlis";
// import { useModal } from "@/app/hooks/useModal";
// import { useProducts } from "@/app/hooks/useProducts";
// import { useProductForm } from "@/app/hooks/useProductForm";
// import AddButton from "../ui/Button";
// import FormField from "../ui/FormField";
// import CancelButton from "../ui/CancelButton";
// import { ProductData, WalkInOrder } from "@/lib/interfaces";
// import { formatPackageType, unitsMeasuredByAmount } from "@/lib/utils";
// import { CiSearch } from "react-icons/ci";
// import { FiPlusCircle } from "react-icons/fi";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectLabel,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import Modal from "../ui/Modal";
// import { RiMedicineBottleFill } from "react-icons/ri";
// import { MdOutlineDiscount } from "react-icons/md";

// interface CartItem {
//   id: number;
//   product: ProductData;
//   quantity: number;
//   quantityType: "units" | "packages";
//   unit: string;
//   unitPrice: number;
//   totalUnits: number;
//   fullPackages: number;
//   looseUnits: number;
//   smallestUnit?: string;
// }

// const WalkInOrderComponent = () => {
//   const [isPrinting, setIsPrinting] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const { data: session } = useSession();

//   const { isOpen, open, close } = useModal();
//   const { products, fetchProducts } = useProducts();

//   // Search and cart states
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(
//     null
//   );
//   const [quantity, setQuantity] = useState("");
//   const [quantityType, setQuantityType] = useState<"units" | "packages">(
//     "units"
//   );
//   const [cartItems, setCartItems] = useState<CartItem[]>([]);
//   const [recentlyAdded, setRecentlyAdded] = useState<number[]>([]);
//   const [showDiscount, setShowDiscount] = useState<boolean>(false);
//   const [discountPercent, setDiscountPercent] = useState<string>("");
//   const discountRef = useRef<HTMLDivElement | null>(null);

//   const {
//     register,
//     handleSubmit,
//     formState: { isSubmitting },
//     setError,
//     reset,
//   } = useForm<TWalkInOrderSchema>({
//     resolver: zodResolver(WalkInOrderSchema),
//     mode: "onChange",
//     defaultValues: {
//       customer_name: "",
//       products: [],
//     },
//   });

//   const { handleSubmitWrapper } = useProductForm<TWalkInOrderSchema>(
//     setError,
//     () => {
//       reset();
//       setCartItems([]);
//       close();
//       fetchProducts();
//     }
//   );

//   // Filter products based on search
//   const filteredProducts = products.filter(
//     (p) =>
//       (p.product_name ?? "")
//         .toLowerCase()
//         .includes(searchQuery.toLowerCase()) ||
//       (p.genericName ?? "").toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleSelectProduct = (product: ProductData) => {
//     setSelectedProduct(product);
//     setSearchQuery("");
//     setQuantity("");
//     setQuantityType("units");
//   };

//   const handleAddToCart = () => {
//     if (!selectedProduct || !quantity || parseFloat(quantity) <= 0) {
//       toast.error("Please enter a valid quantity");
//       return;
//     }

//     const qtyNum = parseFloat(quantity);
//     const totalUnits =
//       quantityType === "packages"
//         ? qtyNum * (selectedProduct.unitsPerPackage || 1)
//         : qtyNum;

//     // Check stock
//     if (totalUnits > selectedProduct.quantity) {
//       toast.error(
//         `Not enough stock! Only ${selectedProduct.quantity} ${selectedProduct.smallestUnit}s available.`
//       );
//       return;
//     }

//     // Calculate full packages and loose units
//     const unitsPerPkg = selectedProduct.unitsPerPackage || 1;
//     const fullPackages =
//       quantityType === "packages"
//         ? qtyNum
//         : Math.floor(totalUnits / unitsPerPkg);
//     const looseUnits =
//       quantityType === "packages" ? 0 : totalUnits % unitsPerPkg;

//     const unit =
//       quantityType === "packages"
//         ? selectedProduct.packageType
//         : selectedProduct.smallestUnit;

//     const unitPrice =
//       quantityType === "packages"
//         ? Number(selectedProduct.pricePerPackage || 0)
//         : Number(selectedProduct.pricePerUnit);

//     const newItem: CartItem = {
//       id: Date.now(),
//       product: selectedProduct,
//       quantity: qtyNum,
//       unit,
//       unitPrice,
//       quantityType,
//       totalUnits,
//       fullPackages,
//       looseUnits,
//     };

//     setCartItems((prev) => [newItem, ...prev]);

//     setRecentlyAdded((prev) => [...prev, newItem.id]);
//     setTimeout(() => {
//       setRecentlyAdded((prev) => prev.filter((id) => id !== newItem.id));
//     }, 5000);

//     setSelectedProduct(null);
//     setQuantity("");
//   };

//   const handleRemoveFromCart = (itemId: number) => {
//     setCartItems((prev) => prev.filter((item) => item.id !== itemId));
//   };

//   useEffect(() => {
//     if (showDiscount) {
//       discountRef.current?.scrollIntoView({
//         behavior: "smooth",
//         block: "center",
//       });
//     }
//   }, [showDiscount]);

//   const total = useMemo(() => {
//     return cartItems.reduce(
//       (sum, item) => sum + item.unitPrice * item.quantity,
//       0
//     );
//   }, [cartItems]);

//   const discountAmount = useMemo(() => {
//     return (total * Number(discountPercent)) / 100;
//   }, [total, discountPercent]);

//   const finalTotal = useMemo(() => {
//     return total - discountAmount;
//   }, [discountAmount, total]);

//   const discountValues = [5, 10, 15, 20, 25, 50];

//   const DiscountButtons = ({ value }: { value: number }) => {
//     return (
//       <button
//         className={`border w-16 py-[5px] rounded-md $`}
//         type="button"
//         onClick={() => setDiscountPercent(String(value))}
//       >
//         {value}%
//       </button>
//     );
//   };

//   const onSubmit = async (data: TWalkInOrderSchema) => {
//     if (cartItems.length === 0) {
//       toast.error("Please add at least one product");
//       return;
//     }

//     // Open print window IMMEDIATELY
//     const printWindow = window.open("", "printReceipt", "width=400,height=600");

//     if (!printWindow) {
//       toast.error("Please allow popups for printing receipts");
//       setIsSaving(false);
//       setIsPrinting(false);
//       return;
//     }

//     setIsPrinting(true);

//     printWindow.document.write(`
//       <html>
//         <head><title>Preparing Receipt...</title></head>
//         <body style="font-family: Arial; text-align: center; padding: 50px;">
//           <h2>Preparing your receipt...</h2>
//           <p>Please wait</p>
//         </body>
//       </html>
//     `);

//     // Prepare order data from cart items
//     const enrichedProducts = cartItems.map((item) => ({
//       productId: item.product.product_name,
//       quantity: item.totalUnits,
//       price: item.unitPrice,
//       smallesUnit: item.smallestUnit,
//     }));

//     const selectedOrder: WalkInOrder = {
//       id: Date.now(),
//       customer: data.customer_name ?? "Unknown",
//       quantity: enrichedProducts.reduce((sum, i) => sum + i.quantity, 0),
//       price: enrichedProducts.reduce((sum, i) => sum + (i.price ?? 0), 0),
//       total: total,
//       createdAt: new Date(),
//       itemDetails: enrichedProducts.map((p) => ({
//         productName: p.productId,
//         quantityOrdered: p.quantity,
//         pricePerUnit: p.price ?? 0,
//         smallestUnit: p.smallesUnit ?? "N/A",
//       })),
//       handledBy: String(session?.user?.username ?? "Unknown"),
//     };

//     await handleWalkInPrint(selectedOrder, printWindow);

//     printWindow.onafterprint = async () => {
//       printWindow.close();
//       setIsPrinting(false);
//       setIsSaving(true);

//       // Prepare data for submission
//       const submissionData: TWalkInOrderSchema = {
//         customer_name: data.customer_name,
//         products: cartItems.map((item) => ({
//           productId: item.product.id,
//           quantity: item.totalUnits,
//         })),
//         discountPercent: Number(discountPercent) || 0,
//         discountAmount: discountAmount || 0,
//       };

//       await handleSubmitWrapper(async () => {
//         await walkInOrder(submissionData);
//         return { success: true };
//       });

//       reset();
//       setCartItems([]);
//       close();
//       fetchProducts();
//       setIsSaving(false);
//       toast.success("Walk In Order Submitted successfully! 🎉", {
//         duration: 10000,
//       });
//     };
//   };

//   const canPartialDispense = selectedProduct?.allowPartialDispensing ?? false;

//   return (
//     <>
//       <AddButton
//         icon={<IoIosWalk />}
//         label="Walk in Order"
//         className="px-6 py-2 mr-8"
//         onClick={open}
//       />

//       {isOpen && (
//         <Modal
//           isOpen={isOpen}
//           onClose={close}
//           padding="0"
//           width="max-w-md"
//           bgColor="bg-gray-50"
//         >
//           <div className=" px-6 py-4 shadow-md">
//             <p className="text-center font-semibold text-lg">
//               Walk In Order Form
//             </p>
//           </div>

//           <form onSubmit={handleSubmit(onSubmit)}>
//             <div className="overflow-y-auto">
//               {/* Customer Info */}
//               <div className="px-6 pb-6 border-b mt-4">
//                 <FormField label="Customer Name (Optional)">
//                   <Input
//                     placeholder="Enter Customer Name"
//                     {...register("customer_name")}
//                     className="rounded-lg bg-white text-sm"
//                   />
//                 </FormField>
//               </div>

//               {/* Product Search Section */}
//               <div className="px-6 py-4 border-b">
//                 <p className="font-medium mb-3 text-sm">
//                   Search & Add Products
//                 </p>
//                 <div className="w-full border px-2 rounded-md flex items-center gap-1 bg-white mb-2">
//                   <CiSearch className="text-xl text-gray-400" />
//                   <Input
//                     type="text"
//                     placeholder="Search by product name or generic name..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="w-full border-none outline-none focus-visible:ring-0 focus-visible:outline-none"
//                   />
//                 </div>

//                 {/* Product Dropdown */}
//                 {searchQuery && filteredProducts.length > 0 && (
//                   <div className="border border-gray-200 rounded-lg divide-y max-h-[13rem] overflow-y-auto mb-4">
//                     {filteredProducts.map((product) => (
//                       <button
//                         key={product.id}
//                         onClick={() => handleSelectProduct(product)}
//                         disabled={product.quantity === 0}
//                         className={`p-3 transition-colors w-full ${
//                           product.quantity === 0
//                             ? "bg-red-50 cursor-not-allowed"
//                             : "cursor-pointer hover:bg-gray-50 bg-white"
//                         }`}
//                         type="button"
//                       >
//                         <div className="flex justify-between items-center">
//                           <div>
//                             <p className="font-medium text-gray-900 text-start">
//                               {product.product_name}
//                             </p>
//                             <p className="text-sm text-gray-600">
//                               {`${
//                                 product.genericName ? product.genericName : ""
//                               } - ${product.strength ? product.strength : ""} ${
//                                 product.dosageForm
//                                   ? formatPackageType(product.dosageForm)
//                                   : ""
//                               }`}
//                             </p>
//                           </div>
//                           <div className="text-right text-sm">
//                             <p className="text-xs text-gray-500 mt-1 flex flex-col">
//                               {product.quantity > 0 ? (
//                                 <>
//                                   Stock: {product.quantity}{" "}
//                                   {product.smallestUnit}
//                                 </>
//                               ) : (
//                                 <span className="text-red-600 ml-2 font-medium">
//                                   Out of Stock
//                                 </span>
//                               )}
//                             </p>
//                           </div>
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 )}

//                 {/* Selected Product Panel */}
//                 {selectedProduct && (
//                   <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50 space-y-4">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <h4 className="font-medium text-gray-900">
//                           {selectedProduct.product_name}
//                         </h4>
//                         <p className="text-sm text-gray-600">
//                           {`${
//                             selectedProduct.genericName
//                               ? selectedProduct.genericName
//                               : ""
//                           } - ${
//                             selectedProduct.strength
//                               ? formatPackageType(
//                                   selectedProduct.strength ?? ""
//                                 )
//                               : ""
//                           } ${
//                             selectedProduct.dosageForm
//                               ? formatPackageType(selectedProduct.dosageForm)
//                               : ""
//                           }`}
//                         </p>
//                       </div>
//                       <button
//                         onClick={() => setSelectedProduct(null)}
//                         className="text-gray-400 hover:text-gray-600"
//                         type="button"
//                       >
//                         <IoIosClose className="text-2xl" />
//                       </button>
//                     </div>

//                     <InventoryBreakdown product={selectedProduct} />

//                     <div className="grid grid-cols-3 gap-3">
//                       <div className="col-span-2">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Quantity
//                         </label>
//                         <Input
//                           type="number"
//                           min={`${
//                             unitsMeasuredByAmount.includes(
//                               selectedProduct.smallestUnit
//                             )
//                               ? "0.1"
//                               : "1"
//                           }`}
//                           step={`${
//                             unitsMeasuredByAmount.includes(
//                               selectedProduct.smallestUnit
//                             )
//                               ? "0.1"
//                               : "1"
//                           }`}
//                           value={quantity}
//                           onChange={(e) => setQuantity(e.target.value)}
//                           placeholder="Enter quantity"
//                           className="bg-white"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Unit Type
//                         </label>
//                         <Select
//                           value={quantityType}
//                           onValueChange={(value: "units" | "packages") =>
//                             setQuantityType(value)
//                           }
//                         >
//                           <SelectTrigger className="bg-white">
//                             <SelectValue
//                               placeholder={selectedProduct.smallestUnit}
//                             />
//                           </SelectTrigger>
//                           <SelectContent className="bg-white">
//                             <SelectGroup>
//                               <SelectLabel>Select Type</SelectLabel>
//                               <SelectItem value="units">
//                                 {formatPackageType(
//                                   selectedProduct.smallestUnit
//                                 )}
//                               </SelectItem>
//                               {canPartialDispense && (
//                                 <SelectItem value="packages">
//                                   {formatPackageType(
//                                     selectedProduct.packageType
//                                   )}
//                                 </SelectItem>
//                               )}
//                               {!canPartialDispense && (
//                                 <SelectItem value="packages">
//                                   Packages Only
//                                 </SelectItem>
//                               )}
//                             </SelectGroup>
//                           </SelectContent>
//                         </Select>
//                       </div>
//                     </div>

//                     {quantity && parseFloat(quantity) > 0 && (
//                       <div className="bg-white rounded p-3 space-y-1 text-sm">
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Quantity:</span>
//                           <span className="font-medium">
//                             {quantity}{" "}
//                             {quantityType === "packages"
//                               ? formatPackageType(selectedProduct.packageType)
//                               : formatPackageType(selectedProduct.smallestUnit)}
//                           </span>
//                         </div>
//                         {quantityType === "packages" && (
//                           <div className="flex justify-between text-gray-600">
//                             <span>Equivalent:</span>
//                             <span>
//                               {parseFloat(quantity) *
//                                 (selectedProduct.unitsPerPackage || 1)}{" "}
//                               {formatPackageType(selectedProduct.smallestUnit)}
//                             </span>
//                           </div>
//                         )}

//                         {selectedProduct.smallestUnit === "ml" &&
//                           selectedProduct.allowPartialDispensing && (
//                             <div className="mt-3 pt-3 border-t border-gray-200">
//                               <p className="text-xs font-medium text-gray-700 mb-2">
//                                 After dispensing:
//                               </p>
//                               {(() => {
//                                 const requestedUnits =
//                                   quantityType === "packages"
//                                     ? parseFloat(quantity) *
//                                       (selectedProduct.unitsPerPackage || 1)
//                                     : parseFloat(quantity);
//                                 const remainingStock =
//                                   selectedProduct.quantity - requestedUnits;

//                                 if (remainingStock < 0) {
//                                   return (
//                                     <p className="text-xs text-red-600">
//                                       ⚠️ Insufficient stock
//                                     </p>
//                                   );
//                                 }

//                                 const afterBreakdown =
//                                   calculatePackageBreakdown(
//                                     remainingStock,
//                                     selectedProduct.unitsPerPackage || 1
//                                   );

//                                 return (
//                                   <div className="space-y-1 text-xs">
//                                     {afterBreakdown.unopenedPackages > 0 && (
//                                       <div className="flex justify-between text-gray-600">
//                                         <span>Unopened:</span>
//                                         <span>
//                                           {afterBreakdown.unopenedPackages}{" "}
//                                           {formatPackageType(
//                                             selectedProduct.packageType
//                                           )}
//                                           (s)
//                                         </span>
//                                       </div>
//                                     )}
//                                     {afterBreakdown.openedPackages > 0 && (
//                                       <div className="flex justify-between text-gray-600">
//                                         <span>Opened:</span>
//                                         <span>
//                                           {afterBreakdown.looseUnitsInOpened}{" "}
//                                           {selectedProduct.smallestUnit} left
//                                         </span>
//                                       </div>
//                                     )}
//                                     <div className="flex justify-between font-medium text-gray-800 pt-1 border-t">
//                                       <span>Total Remaining:</span>
//                                       <span>
//                                         {afterBreakdown.totalLooseUnits}{" "}
//                                         {selectedProduct.smallestUnit}
//                                       </span>
//                                     </div>
//                                   </div>
//                                 );
//                               })()}
//                             </div>
//                           )}
//                       </div>
//                     )}

//                     <button
//                       onClick={handleAddToCart}
//                       type="button"
//                       disabled={!quantity || parseFloat(quantity) <= 0}
//                       className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                     >
//                       <FiPlusCircle className="text-lg" />
//                       Add to Cart
//                     </button>
//                   </div>
//                 )}
//               </div>

//               {/* Cart Items */}
//               {cartItems.length > 0 && (
//                 <div className="px-6 py-4">
//                   <h3 className="font-medium mb-3 flex items-center gap-2">
//                     <span>Cart</span>
//                     <span className="text-sm text-gray-500">
//                       ({cartItems.length} items)
//                     </span>
//                   </h3>

//                   <div className="flex flex-col gap-2">
//                     {cartItems.map((item) => (
//                       <div
//                         key={item.id}
//                         className={`p-3 flex justify-between items-start hover:bg-gray-50 bg-white border rounded-lg ${
//                           recentlyAdded.includes(item.id)
//                             ? "border border-green-400 animate-pulse rounded-md"
//                             : ""
//                         }`}
//                       >
//                         <div className="flex flex-col gap-2 w-full">
//                           <div className="flex gap-2 flex-col text-start">
//                             <p className="font-medium text-gray-900">
//                               {item.product.product_name}
//                             </p>
//                             <p className="text-sm text-gray-600">
//                               {`${item.product.genericName ?? ""} ${
//                                 item.product.strength ?? ""
//                               } ${
//                                 item.product.dosageForm
//                                   ? formatPackageType(item.product.dosageForm)
//                                   : ""
//                               }`}
//                             </p>
//                           </div>

//                           <div className="flex items-center w-full gap-3">
//                             {/* Left: Quantity */}
//                             <div className="text-gray-600 flex gap-2 items-center shrink-0">
//                               {item.fullPackages > 0 && (
//                                 <div className="font-medium items-center gap-1 text-xs flex">
//                                   <div className="px-2 py-1 bg-green-100 text-green-800 rounded-md">
//                                     <span>📦</span>
//                                     {item.fullPackages}pcs of{" "}
//                                     {formatPackageType(
//                                       item.product.packageType
//                                     )}
//                                   </div>
//                                   <span className="text-gray-500 text-xs">
//                                     ({item.totalUnits}{" "}
//                                     {formatPackageType(
//                                       item.product.smallestUnit
//                                     )}
//                                     )
//                                   </span>
//                                 </div>
//                               )}

//                               {item.looseUnits > 0 && (
//                                 <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded-md font-medium inline-flex items-center gap-1 text-xs">
//                                   <RiMedicineBottleFill />
//                                   {item.looseUnits} {item.product.smallestUnit}
//                                 </span>
//                               )}
//                             </div>

//                             {/* Middle: Divider */}
//                             <div className="flex-1 border-t border-dashed border-gray-300" />

//                             {/* Right: Price */}
//                             <div className="text-sm font-medium text-gray-900 shrink-0 whitespace-nowrap">
//                               ₱
//                               {(item.unitPrice * item.quantity).toLocaleString(
//                                 "en-PH",
//                                 {
//                                   minimumFractionDigits: 2,
//                                   maximumFractionDigits: 2,
//                                 }
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                         <div className="flex items-start gap-3">
//                           <button
//                             onClick={() => handleRemoveFromCart(item.id)}
//                             type="button"
//                             className="text-red-500 hover:text-red-700 transition-colors"
//                           >
//                             <IoIosClose className="text-2xl" />
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {cartItems.length === 0 && !selectedProduct && !searchQuery && (
//                 <div className="px-8 py-12 text-center text-gray-400">
//                   <p className="text-lg mb-1">No products added yet</p>
//                   <p className="text-sm">Search and add products to start</p>
//                 </div>
//               )}

//               {showDiscount && (
//                 <div className="my-4 border-t pt-4" ref={discountRef}>
//                   <div
//                     className={`shadow-sm rounded-md p-4 bg-white border mx-6`}
//                   >
//                     <p className="text-sm text-green-600">% Apply Discount</p>
//                     <div className="relative">
//                       <input
//                         type="number"
//                         value={discountPercent}
//                         onChange={(e) => {
//                           const value = e.target.value;

//                           if (value === "") {
//                             setDiscountPercent("");
//                           }

//                           const num = Number(value);

//                           if (num < 0.1) return;
//                           if (num > 100) return;

//                           setDiscountPercent(value);
//                         }}
//                         min={0.1}
//                         step="any"
//                         max={100}
//                         className="bg-slate-50 w-full rounded-full mt-2 pl-8 pr-4 py-2 outline-none text-sm"
//                         placeholder="Enter discount %"
//                       />
//                       <MdOutlineDiscount className="absolute top-[18px] left-2 text-slate-400 font-semibold text-lg" />
//                       <div className="flex text-xs mt-2 gap-2">
//                         {discountValues.map((value) => (
//                           <DiscountButtons key={value} value={value} />
//                         ))}
//                       </div>
//                     </div>{" "}
//                     <div className="mt-4 flex flex-col gap-2">
//                       <div className="border-b text-xs flex gap-2 flex-col pb-2">
//                         <div className="flex items-center justify-between ">
//                           <p className="text-slate-500">Subtotal (item)</p>
//                           <p className="text-slate-600 font-semibold">
//                             ₱{total}
//                           </p>
//                         </div>
//                         <div className="flex items-center justify-between text-green-500">
//                           <p>Discount applied</p>
//                           <p className="font-semibold">
//                             -₱{discountAmount.toFixed(2)}
//                           </p>
//                         </div>
//                       </div>
//                       <p className="flex justify-between text-sm font-semibold items-center">
//                         Total Due{" "}
//                         <span className="text-lg font-bold">
//                           ₱{finalTotal.toFixed(2)}
//                         </span>
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Footer */}
//             <div className=" bg-white border-t rounded-t-2xl px-6 py-3">
//               <div className="flex justify-between">
//                 <p className="border inline-flex px-2 py-1 rounded-lg text-xs uppercase text-gray-600 items-center gap-1">
//                   Total:{" "}
//                   <span className="text-gray-900 font-semibold text-base">
//                     ₱{finalTotal.toFixed(2)}
//                   </span>
//                 </p>

//                 {showDiscount ? (
//                   <button
//                     type="button"
//                     className="border border-green-500 px-4 py-1 rounded-lg text-gray-600 text-sm hover:bg-green-50"
//                     onClick={() => {
//                       setShowDiscount(false);
//                       setDiscountPercent("0");
//                     }}
//                   >
//                     Remove Discount %
//                   </button>
//                 ) : (
//                   <button
//                     type="button"
//                     className="border border-green-500 px-4 py-1 rounded-lg text-gray-600 text-sm hover:bg-green-50"
//                     onClick={() => {
//                       setShowDiscount(true);
//                     }}
//                   >
//                     Apply Discount %
//                   </button>
//                 )}
//               </div>

//               <div className="flex items-end justify-end mt-3 gap-4">
//                 <CancelButton
//                   setIsModalOpen={close}
//                   reset={reset}
//                   onClick={() => {
//                     setCartItems([]);
//                     setShowDiscount(false);
//                   }}
//                 />
//                 <button
//                   type="submit"
//                   className={`w-full justify-center flex py-2 rounded-lg text-white ${
//                     isSubmitting || isSaving || isPrinting
//                       ? "bg-gray-400 cursor-not-allowed"
//                       : "bg-[#2b9e78] hover:bg-[#41b08d] transition-all duration-300 ease-in-out"
//                   }`}
//                   disabled={isSubmitting || isSaving || isPrinting}
//                 >
//                   {isPrinting ? (
//                     <div className="flex items-center gap-2">Printing...</div>
//                   ) : isSaving ? (
//                     <div className="flex items-center gap-2">Saving...</div>
//                   ) : (
//                     <div className="flex items-center gap-2">
//                       <LuPrinter /> <p>Print Receipt</p>
//                     </div>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </form>
//         </Modal>
//       )}
//     </>
//   );
// };

// export default WalkInOrderComponent;
