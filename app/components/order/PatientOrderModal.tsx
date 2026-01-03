import React, { useMemo, useRef, useState } from "react";
import Modal from "../ui/Modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OrderModalSkeleton } from "../ui/Skeleton";
import { Order, OrderItem, Patient } from "@/lib/interfaces";
import CancelButton from "../ui/CancelButton";
import { IoIosArrowDown, IoMdCheckmark, IoIosArrowUp } from "react-icons/io";
import formatStatus, {
  formatPackageType,
  formattedDateTime,
  getInitials,
  stringToDarkColor,
} from "@/lib/utils";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import LoadingButton from "@/components/loading-button";
import { RiFileList3Line } from "react-icons/ri";
import { discounts } from "../walkin_pos/Payment";
import SelectField from "../ui/SelectField";
import { Input } from "@/components/ui/input";
import { FaPesoSign } from "react-icons/fa6";

interface PatientOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

const PatientOrderModal: React.FC<PatientOrderModalProps> = ({
  isOpen,
  onClose,
  patient,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
  const [discountType, setDiscountType] = useState<
    "NONE" | "PWD" | "CUSTOM" | "SENIOR"
  >("NONE");
  const [customDiscount, setCustomDiscount] = useState<number | "">("");
  const [amountTendered, setAmountTendered] = useState<string>("");
  const amountRef = useRef<HTMLInputElement>(null);

  const fetchPatientOrders = async (patientId: string | undefined) => {
    const res = await fetch(`api/request_order/${patientId}/patient_orders`);
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["patient-orders", patient?.id],
    queryFn: () => fetchPatientOrders(patient?.id),
    enabled: isOpen && !!patient?.id,
    refetchOnWindowFocus: false,
  });

  const queryClient = useQueryClient();

  const payOrder = useMutation({
    mutationFn: async () => {
      if (
        discountType === "CUSTOM" &&
        (!customDiscount || Number(customDiscount) <= 0)
      ) {
        toast.error("Please enter a valid custom discount", { duration: 5000 });
        return;
      }

      if (!amountTendered || tendered <= 0) {
        toast.error("Please enter amount tendered", { duration: 5000 });
        amountRef.current?.focus();
        return;
      }

      if (Number(amountTendered) < totalDue) {
        toast.error("Insufficient amount tendered.", { duration: 5000 });
        amountRef.current?.focus();
        return;
      }

      const res = await fetch("api/request_order/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: selectedOrder,
          amountPaid: tendered,
          payableItems: payableItems,
          discountPercent:
            discountType === "CUSTOM"
              ? Number(customDiscount)
              : discountType === "PWD" || discountType === "SENIOR"
              ? 20
              : 0,
          discountAmount: discountAmount,
          discountType: discountType,
        }),
      });

      if (!res.ok) throw new Error("Payment failed");
      return res.json();
    },
    onSuccess: (data) => {
      console.log("PAID", data);
      console.log("Total Amount Paid:", data.totalAmountPaid);
      console.log("Payments Created:", data.paymentsCreated);
      console.log("discount percent:", discountPercent);
      console.log("discountAmount", discountAmount);
      console.log("totalAfterDiscount", totalAfterDiscount);
      toast.success("Payment Successful" + " ✅", { duration: 10000 });
      queryClient.invalidateQueries({ queryKey: ["patient_order"] });
      refetch();
      onClose();
    },
    onError: (error) => console.error("Payment failed:", error),
  });

  const selectedSubtotal = useMemo(() => {
    if (!data || !data.orders) return 0;

    return data.orders
      .filter((order: Order) => selectedOrder.includes(order.id))
      .reduce(
        (sum: number, order: Order) => sum + Number(order.totalAmount),
        0
      );
  }, [data, selectedOrder]);

  const discountPercent = [5, 10, 15, 20, 25, 50] as const;

  const isVatExempt = discountType === "PWD" || discountType === "SENIOR";
  const vatExclusiveAmount = selectedSubtotal / 1.12;

  const discountRate =
    discountType === "CUSTOM"
      ? Number(customDiscount) / 100
      : isVatExempt
      ? 0.2
      : 0;

  const discountBase = isVatExempt ? vatExclusiveAmount : selectedSubtotal;
  const discountAmount = discountBase * discountRate;

  const vatAmount = isVatExempt ? 0 : vatExclusiveAmount * 0.12;

  const totalDue = isVatExempt
    ? vatExclusiveAmount - discountAmount
    : selectedSubtotal - discountAmount;

  const tendered = Number(amountTendered) || 0;
  const changeValue = Math.max(tendered - totalDue, 0);

  const totalAfterDiscount = totalDue;

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

  if (!isOpen) return null;

  if (isLoading) return <OrderModalSkeleton />;

  const toggleSelect = (id: string) => {
    setSelectedOrder((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const hasForPayment = data.orders.some(
    (i: Order) => i.status === "for_payment"
  );

  const payableItems = data.orders.filter(
    (i: Order) => i.status === "for_payment"
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width="max-w-md"
      bgColor="bg-slate-100"
      padding="p-0"
    >
      <div>
        <div className="flex justify-between items-center bg-white p-6">
          <div className="flex items-center gap-4">
            <div
              className="h-10 w-10 rounded-full flex justify-center items-center text-sm font-semibold"
              style={{
                backgroundColor: stringToDarkColor(
                  patient?.patientName ? patient?.patientName : "N/A"
                ),
                color: "#fff",
              }}
            >
              {getInitials(patient?.patientName ? patient?.patientName : "N/A")}
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-semibold">{patient?.patientName}</p>
              <p className="text-xs bg-slate-100 text-slate-500 rounded-lg px-2">
                PID:
                <span className="font-semibold">
                  #0{patient?.patientNumber}
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-col text-end text-xs text-slate-500 ">
            <p className="font-semibold">
              {patient?.unpaidOrders} Pending Order
              {patient?.unpaidOrders === 1 ? "" : "s"}
            </p>
            <p className="text-sm">
              Total of{" "}
              <span className="text-green-500">
                ₱{Number(patient?.totalBalance).toFixed(2)}
              </span>
            </p>
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4">
          <div className="flex gap-4 justify-between mb-4">
            <p className="uppercase text-slate-500 text-sm font-semibold tracking-wider">
              Order List
            </p>
            {hasForPayment && (
              <button
                className="flex items-center gap-2"
                onClick={() => {
                  if (selectedOrder.length === payableItems.length) {
                    setSelectedOrder([]);
                  } else {
                    setSelectedOrder(payableItems.map((i: Order) => i.id));
                  }
                }}
              >
                <p className="text-slate-500 text-sm">
                  {selectedOrder.length === payableItems.length
                    ? "Clear All"
                    : "Select All"}
                </p>
              </button>
            )}
          </div>

          <div className="flex gap-y-4 flex-col">
            {data.orders.map((order: Order) => (
              <button
                key={order.id}
                onClick={() => toggleSelect(order.id)}
                disabled={order.status === "pending"}
                className={`${
                  selectedOrder.includes(order.id) &&
                  "border-2 border-blue-400 rounded-md"
                } ${order.status === "pending" && "opacity-40"}`}
              >
                <div className="bg-white shadow-sm rounded-md p-4 flex justify-between">
                  <div className="flex gap-3 items-center">
                    <div
                      className={`${
                        selectedOrder.includes(order.id)
                          ? "bg-blue-500 text-white flex items-center justify-center text-xs"
                          : "border-2 border-slate-300"
                      } rounded-full w-5 h-5`}
                    >
                      {selectedOrder.includes(order.id) && <IoMdCheckmark />}
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-start font-semibold text-gray-600 text-sm">
                        Order #ORD-0{order.id}{" "}
                        <sup
                          className={`text-[10px] px-2 rounded-md py-[3px] ${
                            order.status === "for_payment"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {formatStatus(order.status)}
                        </sup>
                      </p>
                      <div className="flex gap-2">
                        <p
                          className={`text-xs ${
                            order.type === "EMERGENCY"
                              ? "bg-orange-50 text-orange-700 flex items-center justify-center gap-1"
                              : "bg-blue-50 text-blue-700"
                          } rounded-lg px-2`}
                        >
                          {order.type === "EMERGENCY" && (
                            <span className="bg-orange-600 w-[5px] h-[5px] rounded-full inline-block"></span>
                          )}
                          {order.type === "EMERGENCY" ? "Pay Later" : "Regular"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formattedDateTime(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <p className="text-sm font-semibold">
                      ₱{Number(order.totalAmount).toFixed(2)}
                    </p>
                    {selectedOrder.includes(order.id) ? (
                      <IoIosArrowUp className="mt-3 text-gray-400" />
                    ) : (
                      <IoIosArrowDown className="mt-3 text-gray-400" />
                    )}
                  </div>
                </div>

                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={
                    selectedOrder.includes(order.id)
                      ? { height: "auto", opacity: 1 }
                      : { height: 0, opacity: 0 }
                  }
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-4 text-xs">
                    {order?.itemDetails?.map((item: OrderItem) => (
                      <div
                        key={item.id}
                        className="border-b flex items-center justify-between py-3"
                      >
                        <p className="font-semibold text-slate-700">{`${
                          item.productName
                        } ${item.strength} ${formatPackageType(
                          item.dosageForm ?? ""
                        )}`}</p>
                        <div className="flex flex-col gap-1">
                          <p className="text-end font-semibold text-slate-700">
                            ₱{Number(item.subTotal).toFixed(2)}
                          </p>
                          <p className="text-slate-500 ">
                            {`${item.quantityOrdered}x @ ₱${Number(
                              item.price
                            ).toFixed(2)}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </button>
            ))}
          </div>

          <div className="mt-8">
            <div
              className={`shadow-sm rounded-md p-4 bg-white ${
                selectedOrder.length < 1 ? "opacity-30" : ""
              }`}
            >
              <p className="text-sm text-gray-700">Discount</p>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor=""
                  className=" font-medium mb-[3px] text-gray-500 flex gap-2 items-center text-sm mt-2"
                >
                  Discount Type
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
                    className=" font-medium mb-[3px] text-gray-500 flex gap-2 items-center text-sm mt-4"
                  >
                    Custom Discount %
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

            <div className="mt-4 flex flex-col gap-2">
              <div className="border-b text-xs flex gap-2 flex-col pb-2">
                <div className="flex items-center justify-between ">
                  <p className="text-slate-500">Subtotal</p>
                  <p className="text-slate-600 font-semibold">
                    {selectedSubtotal.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 flex items-center gap-2">
                    VAT(12%){" "}
                    <span
                      className={`border lowercase ${
                        discountType === "PWD" || discountType === "SENIOR"
                          ? "bg-orange-50 border-orange-200 text-orange-700"
                          : "bg-green-50 border-green-200 text-green-700"
                      } text-[10px] p-1 rounded-lg font-bold`}
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

                <div className="flex items-center justify-between text-green-500">
                  <p>
                    Discount applied{" "}
                    <span
                      className={`border lowercase bg-green-50 border-green-200 text-green-700 text-[10px] p-1 rounded-lg font-bold ml-2`}
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
                  <p className="font-semibold">-₱{discountAmount.toFixed(2)}</p>
                </div>
              </div>
              <p className="flex justify-between text-sm font-semibold items-center">
                Total Due{" "}
                <span className="text-lg font-bold">
                  ₱{Number(totalDue).toFixed(2)}
                </span>
              </p>
            </div>
          </div>

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
      </div>
      <div className="bg-white px-2 py-4 flex justify-end gap-4 text-sm">
        <CancelButton onClick={onClose} />
        <button
          className={`px-8 rounded-md text-white ${
            selectedOrder.length < 1
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-buttonBgColor hover:bg-buttonHover"
          }`}
          onClick={() => payOrder.mutate()}
          disabled={selectedOrder.length < 1 || payOrder.isPending}
        >
          {payOrder.isPending ? (
            <LoadingButton color="white" />
          ) : (
            "Process Payment"
          )}
        </button>
      </div>
    </Modal>
  );
};

export default PatientOrderModal;
