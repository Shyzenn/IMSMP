import DashboardCards from "@/app/components/DashboardCards";
import NurseLowStockList from "@/app/components/NurseLowStockList";
import RecentRequestOrder from "@/app/components/RecentRequestOrder";
import SalesGraph from "@/app/components/Top5RequestedProduct";
import {
  TbShoppingCart,
  TbShoppingCartDown,
  TbShoppingCartUp,
  TbShoppingCartX,
} from "react-icons/tb";

export default function Dashboard() {
  const nurseCards = [
    {
      title: "Total Request",
      value: 55,
      icon: TbShoppingCart,
      bgColor: "bg-blue-100",
      link: "",
      textColor: "text-blue-600",
    },
    {
      title: "Pending",
      value: 8,
      icon: TbShoppingCartDown,
      bgColor: "bg-yellow-100",
      link: "",
      textColor: "text-yellow-600",
    },
    {
      title: "For Payment",
      value: 48,
      icon: TbShoppingCartUp,
      bgColor: "bg-green-100",
      link: "",
      textColor: "text-green-600",
    },
    {
      title: "Fulfilled",
      value: 8,
      icon: TbShoppingCartX,
      bgColor: "bg-red-100",
      link: "",
      textColor: "text-red-600",
    },
  ];

  return (
    <div className="h-full flex flex-col gap-5">
      <div className="h-[15%]">
        <DashboardCards cards={nurseCards} />
      </div>
      <div className="h-[35%] flex gap-x-4 w-full">
        <SalesGraph />
        <NurseLowStockList />
      </div>
      <div className="bg-white h-[45%] rounded-md">
        <RecentRequestOrder />
      </div>
    </div>
  );
}
