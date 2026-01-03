// "use client";

// import React, { useState } from "react";
// import { useForm, Path, useFieldArray } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import toast from "react-hot-toast";
// import { Input } from "@/components/ui/input";
// import { IoIosClose } from "react-icons/io";
// import LoadingButton from "@/components/loading-button";
// import { useQueryClient } from "@tanstack/react-query";
// import { capitalLetter } from "@/lib/utils";
// import {
//   editMedTechRequestSchema,
//   TEditMedTechRequestSchema,
// } from "@/lib/types";
// import { useProducts } from "../../hooks/useProducts";
// import { useProductDropdown } from "../../hooks/useProductDropDown";
// import { useProductForm } from "../../hooks/useProductForm";
// import CancelButton from "../ui/CancelButton";
// import { IoAddOutline } from "react-icons/io5";
// import { Textarea } from "@/components/ui/textarea";
// import { RequestView } from "./MTRequestDetails";
// import { OrderItem } from "@/lib/interfaces";
// import { editMedTechRequest } from "@/lib/action/add";

// const MTRequestEdit = ({
//   setShowRequestEdit,
//   requestData,
// }: {
//   setShowRequestEdit: React.Dispatch<React.SetStateAction<boolean>>;
//   requestData?: RequestView;
// }) => {
//   const { products } = useProducts();
//   const queryClient = useQueryClient();
//   const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//     setError,
//     reset,
//     control,
//     setValue,
//     watch,
//     clearErrors,
//   } = useForm<TEditMedTechRequestSchema>({
//     resolver: zodResolver(editMedTechRequestSchema),
//     mode: "onChange",
//     defaultValues: {
//       status: requestData?.status,
//       notes: requestData?.notes,
//       products: requestData?.itemDetails?.map((item: OrderItem) => ({
//         productId: item.productName,
//         quantity: item.quantity,
//       })) || [{ productId: "", quantity: 0 }],
//     },
//   });

//   const {
//     dropdownIndex,
//     filteredProducts,
//     handleFocus,
//     handleSelectProduct,
//     handleInputChangeProduct,
//     selectedQuantity,
//     dropdownRefs,
//   } = useProductDropdown<TEditMedTechRequestSchema>(
//     products,
//     setValue,
//     clearErrors
//   );

//   const { handleSubmitWrapper } = useProductForm<TEditMedTechRequestSchema>(
//     setError,
//     () => {
//       reset();
//       toast.success("Request Updated Submitted successfully! 🎉", {
//         duration: 10000,
//       });
//       setShowRequestEdit(false);
//       queryClient.invalidateQueries({ queryKey: ["medtech_request"] });
//     }
//   );

//   const watchProducts = watch("products");

//   const isQuantityExceeded = watchProducts.some(
//     (product, index) =>
//       product.productId.trim() !== "" &&
//       selectedQuantity[index] !== undefined &&
//       product.quantity > selectedQuantity[index]
//   );

//   const { fields, prepend, remove } = useFieldArray({
//     control,
//     name: "products",
//   });

//   const onSubmit = async (data: TEditMedTechRequestSchema) => {
//     const hasInvalidProduct = data.products.some((product, index) => {
//       const exists = products.some(
//         (p) =>
//           p.productName.toLowerCase() === product.productId.trim().toLowerCase()
//       );
//       if (!exists) {
//         setError(
//           `products.${index}.productId` as Path<TEditMedTechRequestSchema>,
//           {
//             type: "manual",
//             message: "Product does not exist",
//           }
//         );
//       }
//       return !exists;
//     });

//     if (hasInvalidProduct) return;

//     const updatedData: TEditMedTechRequestSchema = {
//       ...data,
//     };

//     await handleSubmitWrapper(() =>
//       editMedTechRequest(updatedData, String(requestData?.id))
//     );
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
//       <div className="bg-white w-full max-w-[500px] max-h-[95vh] rounded-md relative overflow-hidden">
//         <p className="text-center font-semibold text-xl py-4">
//           Edit Request Form (REQ-0{requestData?.id}){" "}
//         </p>

//         <form className="pb-[70px] mt-6" onSubmit={handleSubmit(onSubmit)}>
//           <div className="overflow-y-auto max-h-[calc(95vh-150px)]">
//             <div className="flex flex-col mx-8">
//               <label className="text-sm text-start font-medium mb-[3px] text-gray-700">
//                 Message
//               </label>
//               <Textarea
//                 placeholder="Type your message here. (Optional)"
//                 {...register("notes")}
//               />
//             </div>

//             <div className="p-8 h-[10%]">
//               <button
//                 type="button"
//                 onClick={() => prepend({ productId: "", quantity: 0 })}
//                 className={`px-8 py-2 rounded-md text-black flex items-center gap-2 ${
//                   isQuantityExceeded
//                     ? "bg-gray-400 cursor-not-allowed"
//                     : "bg-white border border-[#41b08d] hover:bg-[#41b08d] hover:text-white transition-all duration-300 ease-in-out "
//                 }`}
//                 disabled={isQuantityExceeded}
//               >
//                 <IoAddOutline className="text-xl" /> Add Product
//               </button>

//               <div className="flex justify-between text-sm font-medium mb-[3px] text-gray-700 mt-8 mr-[118px]">
//                 <p>Product Name</p>
//                 <p>Quantity</p>
//               </div>

//               <ul className="flex flex-col gap-4 mt-4 relative w-full">
//                 {fields.map((item, index) => (
//                   <li
//                     key={item.id}
//                     className="items-center w-full"
//                     ref={(el) => {
//                       dropdownRefs.current[index] = el;
//                     }}
//                   >
//                     <div className="flex gap-8 w-full">
//                       {/* Product Input */}
//                       <div className="relative w-[53%]">
//                         <Input
//                           autoComplete="off"
//                           placeholder="Enter Product Name"
//                           {...register(`products.${index}.productId` as const, {
//                             required: true,
//                           })}
//                           className={`w-full ${
//                             errors.products?.[index]?.productId
//                               ? "border-red-500 focus:ring-red-500"
//                               : ""
//                           }`}
//                           onFocus={() => {
//                             handleFocus(index);
//                             setHighlightedIndex(0);
//                           }}
//                           onChange={(e) => {
//                             handleInputChangeProduct(index, e.target.value);
//                             setHighlightedIndex(0);
//                           }}
//                           onKeyDown={(e) => {
//                             if (e.key === "ArrowDown") {
//                               e.preventDefault();
//                               setHighlightedIndex(
//                                 (prev) =>
//                                   (prev === null ? 0 : prev + 1) %
//                                   filteredProducts.length
//                               );
//                             } else if (e.key === "ArrowUp") {
//                               e.preventDefault();
//                               setHighlightedIndex((prev) =>
//                                 prev === null || prev === 0
//                                   ? filteredProducts.length - 1
//                                   : prev - 1
//                               );
//                             } else if (
//                               e.key === "Enter" &&
//                               highlightedIndex !== null
//                             ) {
//                               const product =
//                                 filteredProducts[highlightedIndex];
//                               if (product.quantity > 0) {
//                                 handleSelectProduct(index, product.productName);
//                               }
//                             }
//                           }}
//                         />

//                         {/* Errors */}
//                         <div className="flex justify-between">
//                           {errors.products?.[index]?.productId && (
//                             <p className="text-red-500 text-sm mt-1">
//                               {errors.products[index].productId?.message}
//                             </p>
//                           )}
//                           {selectedQuantity[index] !== undefined &&
//                             watchProducts?.[index]?.quantity >
//                               selectedQuantity[index] && (
//                               <p className="text-sm text-red-500 mt-1 text-center mr-3">
//                                 Exceeds available stock (
//                                 {selectedQuantity[index]} left)
//                               </p>
//                             )}
//                         </div>

//                         {/* Dropdown */}
//                         {dropdownIndex === index &&
//                           filteredProducts.length > 0 && (
//                             <ul className="absolute bottom-full mb-2 z-20 w-[26.5rem] bg-white border border-gray-300 shadow-md rounded-md max-h-60 overflow-y-auto">
//                               {filteredProducts.map((product, i) => (
//                                 <li
//                                   key={product.id}
//                                   className={`p-2 ${
//                                     product.quantity === 0
//                                       ? "bg-red-100 text-gray-400 cursor-not-allowed"
//                                       : "cursor-pointer hover:bg-gray-100"
//                                   } ${
//                                     highlightedIndex === i ? "border-2" : ""
//                                   }`}
//                                   onMouseEnter={() => setHighlightedIndex(i)}
//                                   onClick={() => {
//                                     if (product.quantity > 0) {
//                                       handleSelectProduct(
//                                         index,
//                                         product.productName
//                                       );
//                                     }
//                                   }}
//                                 >
//                                   <p className="flex justify-between">
//                                     {capitalLetter(product.productName)}
//                                     <span className="text-sm">
//                                       {product.quantity} item
//                                       {product.quantity > 1 ? "s" : ""} left
//                                     </span>
//                                   </p>
//                                 </li>
//                               ))}
//                             </ul>
//                           )}
//                       </div>

//                       {/* Quantity Input */}
//                       <div className="flex flex-col w-[37%]">
//                         <div className="">
//                           <Input
//                             min={0}
//                             type="number"
//                             placeholder="Enter Quantity"
//                             {...register(
//                               `products.${index}.quantity` as const,
//                               {
//                                 valueAsNumber: true,
//                                 required: true,
//                               }
//                             )}
//                             className={`w-full ${
//                               errors.products?.[index]?.quantity
//                                 ? "border-red-500"
//                                 : ""
//                             }`}
//                             disabled={!watch(`products.${index}.productId`)}
//                           />
//                         </div>
//                         {errors.products?.[index]?.quantity && (
//                           <p className="text-red-500 text-sm mt-1">
//                             {errors.products[index].quantity?.message}
//                           </p>
//                         )}
//                       </div>

//                       {/* Remove Product */}
//                       {fields.length > 1 && (
//                         <IoIosClose
//                           className="text-2xl text-red-600 cursor-pointer"
//                           onClick={() => remove(index)}
//                         />
//                       )}
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="flex gap-6 bg-white border-t-2 p-4 absolute bottom-0 left-0 w-full justify-end">
//             <CancelButton
//               setIsModalOpen={() => setShowRequestEdit(false)}
//               reset={reset}
//             />
//             <button
//               type="submit"
//               className={`px-8 py-2 rounded-md text-white ${
//                 isQuantityExceeded || isSubmitting
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-[#2b9e78] hover:bg-[#41b08d] transition-all duration-300 ease-in-out"
//               }`}
//               disabled={isQuantityExceeded || isSubmitting}
//             >
//               {isSubmitting ? <LoadingButton color="text-white" /> : "Submit"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default MTRequestEdit;
