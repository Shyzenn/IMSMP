import React, { useRef, useState } from "react";
import { HiOutlineUser } from "react-icons/hi";
import { Input } from "@/components/ui/input";
import SelectField from "../ui/SelectField";
import { RiFileList3Line } from "react-icons/ri";
import { FaPesoSign } from "react-icons/fa6";
import { FaRegCheckCircle } from "react-icons/fa";
import { CartItem } from "./WalkInPOS";
import toast from "react-hot-toast";
import { WalkInPaymentSchema } from "@/lib/types";
import { formatPackageType } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import PreviewReceipt from "./PreviewReceipt";
import { z } from "zod";
import { printWalkInReceipt } from "@/lib/printUtlis";
import { useSession } from "next-auth/react";
import PrintConfirmationModal from "../ui/PrintConfirmationModa";
import { orderService } from "@/services/order.service";

type WalkInPaymentData = z.infer<typeof WalkInPaymentSchema>;

export const discounts: { label: string; value: string }[] = [
  { label: "None", value: "NONE" },
  { label: "PWD (20%)", value: "PWD" },
  { label: "Senior Citizen (20%)", value: "SENIOR" },
  { label: "Custom Discount", value: "CUSTOM" },
] as const;

const Payment = ({
  subTotal,
  cartItems,
  setCartItems,
}: {
  subTotal: number;
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}) => {
  const [discountType, setDiscountType] = useState<
    "NONE" | "PWD" | "CUSTOM" | "SENIOR"
  >("NONE");
  const [customDiscount, setCustomDiscount] = useState<number | "">("");
  const [amountTendered, setAmountTendered] = useState<string>("");
  const [customerName, setCustomerName] = useState<string | null>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [showPreviewReceipt, setShowPreviewReceipt] = useState<boolean>(false);
  const [showPrintConfirmation, setShowPrintConfirmation] =
    useState<boolean>(false);
  const [pendingPaymentData, setPendingPaymentData] =
    useState<WalkInPaymentData | null>(null);

  const amountRef = useRef<HTMLInputElement>(null);

  const { data: session } = useSession();
  const username = session?.user.username;

  const discountPercent = [5, 10, 15, 20, 25, 50] as const;

  const isVatExempt = discountType === "PWD" || discountType === "SENIOR";

  const vatExclusiveAmount = subTotal / 1.12;

  const discountRate =
    discountType === "CUSTOM"
      ? Number(customDiscount) / 100
      : isVatExempt
      ? 0.2
      : 0;

  const discountBase = isVatExempt ? vatExclusiveAmount : subTotal;
  const discountAmount = discountBase * discountRate;

  const vatAmount = isVatExempt ? 0 : vatExclusiveAmount * 0.12;

  const totalDue = isVatExempt
    ? vatExclusiveAmount - discountAmount
    : subTotal - discountAmount;

  const tendered = Number(amountTendered) || 0;
  const changeValue = Math.max(tendered - totalDue, 0);

  const DiscountButton = ({
    value,
    onClick,
  }: {
    value: number;
    onClick: (value: number) => void;
  }) => {
    return (
      <button
        type="button"
        className="border rounded w-[2.8rem] py-1 text-xs hover:bg-green-50 bg-white text-slate-500"
        onClick={() => onClick(value)}
      >
        {value}%
      </button>
    );
  };

  const handleDiscountTypeChange = (
    value: "NONE" | "PWD" | "CUSTOM" | "SENIOR"
  ) => {
    setDiscountType(value);

    if (value === "PWD" || value === "SENIOR") {
      setCustomDiscount(20);
    } else {
      setCustomDiscount(0);
    }
  };

  const validatePayment = () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty. Please add at least one item.", {
        duration: 5000,
      });
      return false;
    }

    const hasStockIssue = cartItems.some((item) => item.quantity > item.stock);

    if (hasStockIssue) {
      const itemsOverStock = cartItems.filter(
        (item) => item.quantity > item.stock
      );
      const itemName = itemsOverStock.map((item) => {
        const productInfo = [
          item.productName,
          item.strength,
          formatPackageType(item.dosageForm),
        ]
          .filter(Boolean) // Remove empty/null/undefined values
          .join(" ");

        return `${productInfo} (requested: ${item.quantity}, available: ${item.stock})`;
      });

      toast.error(`Stock exceeded for: ${itemName}`, { duration: 5000 });

      return false;
    }

    if (
      discountType === "CUSTOM" &&
      (!customDiscount || Number(customDiscount) <= 0)
    ) {
      toast.error("Please enter a valid custom discount", { duration: 5000 });
      return false;
    }

    if (!amountTendered || tendered <= 0) {
      toast.error("Please enter amount tendered", { duration: 5000 });
      amountRef.current?.focus();
      return false;
    }

    if (Number(amountTendered) < totalDue) {
      toast.error("Insufficient amount tendered.", { duration: 5000 });
      amountRef.current?.focus();
      return;
    }

    return true;
  };

  const queryClient = useQueryClient();

  const handlePrintConfirm = async () => {
    // User confirmed they printed - now submit to backend
    setShowPrintConfirmation(false);

    if (!pendingPaymentData) {
      toast.error("Payment data not found");
      setIsProcessing(false);
      return;
    }

    try {
      const result = await orderService.addWalkInOrder(pendingPaymentData);

      if (result.success) {
        toast.success("Payment Successful", { duration: 3000 });

        // Reset form
        setCartItems([]);
        setAmountTendered("");
        setCustomDiscount(0);
        setCustomerName("");
        setDiscountType("NONE");
        setPendingPaymentData(null);

        // Refresh inventory
        queryClient.invalidateQueries({
          queryKey: ["medicines"],
        });
      }
    } catch (error) {
      console.error("Failed to submit payment", error);
      toast.error("Payment Failed", { duration: 5000 });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintCancel = () => {
    // User did not print - cancel payment
    setShowPrintConfirmation(false);
    setPendingPaymentData(null);
    setIsProcessing(false);
    toast.error("Payment cancelled - Receipt was not printed", {
      duration: 4000,
    });
  };

  const onSubmit = async () => {
    if (!validatePayment()) return;

    const payload = {
      customer_name: customerName || undefined,
      discountType,
      discountPercent:
        discountType === "CUSTOM"
          ? Number(customDiscount)
          : discountType === "PWD" || discountType === "SENIOR"
          ? 20
          : 0,
      amountTendered: Number(amountTendered),
      change: changeValue,
      items: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.price),
      })),
    };

    const parse = WalkInPaymentSchema.safeParse(payload);

    if (!parse.success) {
      console.log("Validation errors:", parse.error.errors);
      toast.error(parse.error.errors[0].message);
      return;
    }

    console.log("VALID PAYMENT DATA", parse.data);

    // Show processing state
    setIsProcessing(true);

    // Store payment data for later submission
    setPendingPaymentData(parse.data);

    // Inform user to print first
    toast.loading("Print the receipt, then confirm to complete payment...", {
      duration: 5000,
    });

    // Print receipt FIRST before submitting to backend
    const printSuccess = printWalkInReceipt(
      {
        customerName: customerName || undefined,
        cartItems: cartItems,
        subtotal: subTotal,
        vatAmount: vatAmount,
        discountAmount: discountAmount,
        totalDue: totalDue,
        amountTendered: tendered,
        change: changeValue,
        discountType: discountType,
        isVatExempt: isVatExempt,
        username: username,
      },
      // Callback - show confirmation modal after print dialog closes
      () => {
        setShowPrintConfirmation(true);
      }
    );

    if (!printSuccess) {
      toast.error("Failed to open print window", { duration: 3000 });
      setIsProcessing(false);
      setPendingPaymentData(null);
    }
  };

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="px-6 h-full overflow-y-auto scrollbar scrollbar-thin scrollbar-thumb flex-1 pb-8">
          {/* CUSTOMER DETAILS */}
          <section className="">
            <p className="flex items-center gap-2 uppercase font-semibold text-sm tracking-wider">
              <span className="w-6 h-6 bg-green-50 rounded-full flex justify-center items-center">
                {" "}
                <HiOutlineUser className="text-green-700 text-xs" />
              </span>
              Customer
            </p>

            <div className="border rounded-lg bg-slate-50 p-4 text-xs mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="customer_name"
                  className=" font-medium mb-[3px] text-gray-500 flex gap-2 items-center"
                >
                  NAME (Optional)
                </label>
                <Input
                  type="text"
                  id="customer_name"
                  placeholder="Enter Customer Name"
                  className="bg-white"
                  value={customerName ?? ""}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor=""
                  className=" font-medium mb-[3px] text-gray-500 flex gap-2 items-center"
                >
                  DISCOUNT TYPE
                </label>
                <SelectField
                  inputWidth="bg-white"
                  label="Select Discount Type"
                  option={discounts}
                  defaultValue="none"
                  value={discountType}
                  onChange={(val) =>
                    handleDiscountTypeChange(
                      val as "NONE" | "PWD" | "CUSTOM" | "SENIOR"
                    )
                  }
                />
              </div>

              {discountType === "CUSTOM" && (
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="custom_discount"
                    className=" font-medium mb-[3px] text-gray-500 flex gap-2 items-center"
                  >
                    CUSTOM DISCOUNT %
                  </label>
                  <Input
                    className="bg-white"
                    type="number"
                    min={0.1}
                    max={100}
                    value={customDiscount}
                    onChange={(e) => {
                      const value = e.target.value;

                      if (value === "") {
                        setCustomDiscount("");
                        return;
                      }

                      const num = Number(value);

                      if (num < 0.1) return;
                      if (num > 100) return;

                      setCustomDiscount(num);
                    }}
                    id="custom_discount"
                    placeholder="Enter Custom Discount %"
                  />
                  <div className="flex gap-2 justify-center flex-wrap">
                    {discountPercent.map((discount) => (
                      <DiscountButton
                        key={discount}
                        value={discount}
                        onClick={(val) => setCustomDiscount(val)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* SUMMARY */}
          <section className="mt-8">
            <p className="flex items-center gap-2 uppercase font-semibold text-sm tracking-wider">
              <span className="w-6 h-6 bg-green-50 rounded-full flex justify-center items-center">
                {" "}
                <RiFileList3Line className="text-green-700 text-xs" />
              </span>
              summary
            </p>
            <div className="border rounded-lg bg-slate-50 p-4 mt-4 flex flex-col gap-4">
              <p className="flex justify-between items-center text-gray-500">
                Subtotal{" "}
                <span className="font-semibold text-black">
                  ₱{Number(subTotal).toFixed(2)}
                </span>
              </p>
              <div className="flex justify-between items-center">
                <p className="text-gray-500 flex items-center gap-2">
                  VAT(12%){" "}
                  <span
                    className={`border lowercase ${
                      discountType === "PWD" || discountType === "SENIOR"
                        ? "bg-orange-50 border-orange-200 text-orange-700"
                        : "bg-green-50 border-green-200 text-green-700"
                    } text-[10px] p-2 rounded-lg font-bold`}
                  >
                    {discountType === "PWD" || discountType === "SENIOR"
                      ? "exempt"
                      : "included"}
                  </span>
                </p>
                <p
                  className={`font-semibold ${
                    discountType === "PWD" || discountType === "SENIOR"
                      ? "line-through decoration-red-400 text-gray-300"
                      : "text-gray-500 "
                  }`}
                >
                  ₱{Number(vatAmount).toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-500 flex items-center gap-2">
                  Discount{" "}
                  <span
                    className={`border lowercase bg-green-50 border-green-200 text-green-700 text-[10px] p-2 rounded-lg font-bold`}
                  >
                    -
                    {customDiscount
                      ? customDiscount
                      : discountType === "PWD" || discountType === "SENIOR"
                      ? 20
                      : 0}
                    %
                  </span>
                </p>
                <p className="font-semibold text-green-600">
                  -₱{Number(discountAmount).toFixed(2)}
                </p>
              </div>
              <div className="border-t-[1.5px] border-dashed pt-4">
                <p className="font-bold flex items-center justify-between">
                  Total Due{" "}
                  <span className="text-3xl text-green-700">
                    ₱{Number(totalDue).toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* PAYMENT */}
          <section className="mt-8 ">
            <p className="flex items-center gap-2 uppercase font-semibold text-sm tracking-wider">
              <span className="w-6 h-6 bg-green-50 rounded-full flex justify-center items-center">
                {" "}
                <RiFileList3Line className="text-green-700 text-xs" />
              </span>
              payment
            </p>
            <div className="flex flex-col mt-4 gap-2 relative">
              <label
                htmlFor=""
                className="uppercase text-gray-500 font-semibold text-xs tracking-wider"
              >
                amount tendered
              </label>

              <input
                type="number"
                ref={amountRef}
                placeholder="0.00"
                min={0}
                value={amountTendered}
                className="py-3 border rounded-lg pl-10 text-2xl font-semibold no-spinner"
                onChange={(e) => setAmountTendered(e.target.value)}
              />
              <div className="absolute top-[42px] left-4">
                <FaPesoSign className="text-gray-400 text-xl" />
              </div>
            </div>
            <div className="border p-4 rounded-lg mt-4 bg-slate-100">
              <p className="font-semibold flex justify-between">
                Change{" "}
                <span className="font-mono [font-variant-numeric:slashed-zero] text-xl">
                  ₱{Number(changeValue).toFixed(2)}
                </span>
              </p>
            </div>
          </section>
        </div>

        {/* CONFIRM PAYMENT BUTTON */}
        <section className="border-t px-6 flex items-center justify-center flex-col shrink-0">
          <button
            className={` hover:bg-buttonHover py-3 text-white text-lg rounded-lg px-12 mt-8 flex items-center gap-2 ${
              isProcessing ? "bg-buttonHover" : "bg-buttonBgColor"
            }`}
            onClick={() => onSubmit()}
            disabled={isProcessing}
          >
            {isProcessing ? null : <FaRegCheckCircle />}
            {isProcessing ? "Processing Payment..." : "Print & Confirm Payment"}
          </button>
          <button
            className="text-xs text-gray-500 mt-4 border-b border-gray-400 hover:border-gray-900 border-dashed hover:text-black"
            onClick={() => setShowPreviewReceipt(true)}
          >
            Preview Receipt
          </button>
        </section>
      </div>
      {showPreviewReceipt && (
        <PreviewReceipt
          isOpen={showPreviewReceipt}
          close={() => setShowPreviewReceipt(false)}
          customerName={customerName}
          cartItems={cartItems}
          subTotal={subTotal}
          discountType={discountType}
          discountAmount={discountAmount}
          vatAmount={vatAmount}
          totalDue={totalDue}
          amountTendered={tendered}
          change={changeValue}
        />
      )}

      {showPrintConfirmation && (
        <PrintConfirmationModal
          isOpen={showPrintConfirmation}
          onConfirm={handlePrintConfirm}
          onCancel={handlePrintCancel}
        />
      )}
    </>
  );
};

export default Payment;
