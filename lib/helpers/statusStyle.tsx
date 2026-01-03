import { MdOutlineHourglassBottom } from "react-icons/md";
import { FcCancel } from "react-icons/fc";
import { RiRefund2Line } from "react-icons/ri";
import { JSX } from "react";
import { CheckCircle, Clock } from "lucide-react";

interface StatusStyle {
  bg: string;
  text: string;
  icon: JSX.Element;
  label: string;
}

export function getStatusStyle(status: string): StatusStyle {
  const displayStatus =
    status === "for_payment"
      ? "For Payment"
      : status === "paid"
      ? "Paid"
      : status === "pending"
      ? "Pending"
      : status === "refunded"
      ? "Refunded"
      : "Canceled";

  let bg = "bg-gray-100";
  let text = "text-gray-700";
  let icon = <Clock className="w-4 h-4 text-gray-500" />;

  if (displayStatus === "Paid") {
    bg = "bg-green-100";
    text = "text-green-700";
    icon = <CheckCircle className="w-4 h-4 text-green-500" />;
  } else if (displayStatus === "For Payment") {
    bg = "bg-yellow-100";
    text = "text-yellow-700";
    icon = <MdOutlineHourglassBottom className="w-4 h-4 text-yellow-500" />;
  } else if (displayStatus === "Canceled") {
    bg = "bg-red-100";
    text = "text-red-700";
    icon = <FcCancel className="w-4 h-4" />;
  } else if (displayStatus === "Refunded") {
    bg = "bg-orange-100";
    text = "text-orange-700";
    icon = <RiRefund2Line className="w-4 h-4 text-orange-500" />;
  }

  return { bg, text, icon, label: displayStatus };
}
