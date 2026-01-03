import { OrderView } from "@/lib/interfaces";
import { IoCheckmark } from "react-icons/io5";

interface TimelineStep {
  title: string;
  user?: string;
  status: "completed" | "current" | "pending";
  timestamp?: string;
}

export const OrderTimeline = ({ order }: { order: OrderView }) => {
  // Determine current step based on order status and remarks
  const getCurrentStep = () => {
    if (order.status === "refunded" || order.status === "canceled") {
      return 0; // Show all as completed for refunded/canceled
    }

    if (order.type === "EMERGENCY") {
      if (order.status === "paid") return 4;
      if (order.remarks === "dispensed") return 3;
      if (order.remarks === "prepared") return 2;
      return 1;
    } else {
      // Request order flow
      if (order.remarks === "dispensed") return 4;
      if (order.status === "paid") return 3;
      if (order.remarks === "prepared") return 2;
      if (order.status === "for_payment") return 1;
      if (order.status === "pending") return 1;
      return 1;
    }
  };

  const currentStep = getCurrentStep();
  const payment = order.paymentDetails?.[0];

  // Define steps based on order type
  const getSteps = (): TimelineStep[] => {
    if (order.type === "EMERGENCY") {
      return [
        {
          title: "Order Placed",
          user: `Order has been placed by ${order.requestedBy}`,
          status: currentStep >= 1 ? "completed" : "pending",
          timestamp: order.createdAt
            ? new Date(order.createdAt).toLocaleString("en-PH", {
                timeZone: "Asia/Manila",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : undefined,
        },
        {
          title: currentStep === 1 ? "Order Preparing" : "Order Prepared",
          user: ` ${
            currentStep > 1
              ? `Order has been prepared by ${order.preparedBy}`
              : ""
          } ${currentStep === 1 ? "Pending..." : ""}`,
          status:
            currentStep > 1
              ? "completed"
              : currentStep === 1
              ? "current"
              : "pending",
          timestamp: order.preparedAt
            ? new Date(order.preparedAt).toLocaleString("en-PH", {
                timeZone: "Asia/Manila",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : undefined,
        },
        {
          title: currentStep <= 2 ? "Order Dispensing" : "Order Dispensed",
          user: `${
            order.remarks === "dispensed"
              ? `Order has been dispensed by ${order.dispensedBy}`
              : ""
          } ${currentStep === 2 ? "Pending..." : ""}`,
          status:
            currentStep > 2
              ? "completed"
              : currentStep === 2
              ? "current"
              : "pending",
          timestamp: order.dispensedAt
            ? new Date(order.dispensedAt).toLocaleString("en-PH", {
                timeZone: "Asia/Manila",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : undefined,
        },
        {
          title: currentStep <= 3 ? "Payment Confirming" : "Payment Confirmed",
          user: `${
            order.status === "paid"
              ? `Payment has been successfully processed by ${
                  payment?.processedBy.username ?? "-"
                }`
              : ""
          } ${currentStep === 3 ? "Pending..." : ""}`,
          status:
            currentStep === 4
              ? "completed"
              : currentStep === 3
              ? "current"
              : "pending",
          timestamp: payment?.processedAt
            ? new Date(payment?.processedAt).toLocaleString("en-PH", {
                timeZone: "Asia/Manila",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : undefined,
        },
      ];
    } else {
      // Request Order
      return [
        {
          title: "Order Placed",
          user: `Order has been placed by ${order.requestedBy}`,
          status: currentStep >= 1 ? "completed" : "pending",
          timestamp: order.createdAt
            ? new Date(order.createdAt).toLocaleString("en-PH", {
                timeZone: "Asia/Manila",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : undefined,
        },
        {
          title: currentStep === 2 ? "Order Prepared" : "Order Preparing",
          user: ` ${
            currentStep > 1
              ? `Order has been prepared by ${order.preparedBy}`
              : ""
          } ${currentStep === 1 ? "Pending..." : ""}`,
          status:
            currentStep > 1
              ? "completed"
              : currentStep === 1
              ? "current"
              : "pending",
          timestamp: order.preparedAt
            ? new Date(order.preparedAt).toLocaleString("en-PH", {
                timeZone: "Asia/Manila",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : undefined,
        },
        {
          title: currentStep === 3 ? "Payment Confirmed" : "Payment Confirming",
          user: `${
            order.status === "paid"
              ? `Payment has been successfully processed by ${
                  payment?.processedBy.username ?? "-"
                }`
              : ""
          } ${currentStep === 2 ? "Pending..." : ""}`,
          status:
            currentStep > 2
              ? "completed"
              : currentStep === 2
              ? "current"
              : "pending",
          timestamp: payment?.processedAt
            ? new Date(payment?.processedAt).toLocaleString("en-PH", {
                timeZone: "Asia/Manila",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : undefined,
        },
        {
          title: currentStep === 4 ? "Order Dispensed" : "Order Dispensing",
          user: `${
            order.remarks === "dispensed"
              ? `Order has been dispensed by ${order.dispensedBy}`
              : ""
          } ${currentStep === 3 ? "Pending..." : ""}`,
          status:
            currentStep >= 4
              ? "completed"
              : currentStep === 3
              ? "current"
              : "pending",
          timestamp: order.dispensedAt
            ? new Date(order.dispensedAt).toLocaleString("en-PH", {
                timeZone: "Asia/Manila",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : undefined,
        },
      ];
    }
  };

  const steps = getSteps();

  return (
    <div className="border-t py-4 my-4">
      <h4 className="text-sm font-semibold mb-4 text-gray-700">Timeline</h4>
      <div className="relative">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isCompleted = step.status === "completed";
          const isCurrent = step.status === "current";

          return (
            <div key={index} className="relative flex gap-3 pb-6 last:pb-0">
              {/* Vertical Line */}
              {!isLast && (
                <div
                  className={`absolute left-[7px] top-2 w-[2px] h-full ${
                    isCompleted ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />
              )}

              {/* Circle/Check Icon */}
              <div className="relative z-10 flex-shrink-0">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? "bg-blue-500 text-white"
                      : isCurrent
                      ? "bg-blue-500 text-white ring-4 ring-blue-100"
                      : "bg-gray-300"
                  }`}
                >
                  {isCompleted ? (
                    <IoCheckmark className="text-xs" />
                  ) : (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pt-0">
                <div className="flex items-center justify-between">
                  <h5
                    className={`text-sm font-semibold ${
                      isCompleted || isCurrent
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </h5>

                  {step.timestamp && (
                    <p className="text-xs text-gray-400 mt-1">
                      {step.timestamp}
                    </p>
                  )}
                </div>
                {step.user && (
                  <span
                    className={`text-xs ${
                      isCompleted || isCurrent
                        ? "text-gray-600"
                        : "text-gray-400"
                    }`}
                  >
                    {step.user}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
