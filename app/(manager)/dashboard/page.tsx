import DashboardCards from "@/app/components/DashboardCards";
import SalesGraph from "@/app/components/SalesGraph";
import {
  TbShoppingCart,
  TbShoppingCartDown,
  TbShoppingCartUp,
  TbShoppingCartX,
} from "react-icons/tb";

export default function Dashboard() {
  const managerCards = [
    {
      title: "Product",
      value: 2,
      icon: TbShoppingCart,
      bgColor: "bg-blue-50",
      textColor: "text-blue-500",
    },
    {
      title: "Low Stock",
      value: 2,
      icon: TbShoppingCartDown,
      bgColor: "bg-orange-50",
      textColor: "text-orange-500",
    },
    {
      title: "High Stock",
      value: 2,
      icon: TbShoppingCartUp,
      bgColor: "bg-green-50",
      textColor: "text-green-500",
    },
    {
      title: "Expired",
      value: 2,
      icon: TbShoppingCartX,
      bgColor: "bg-red-50",
      textColor: "text-red-500",
    },
  ];

  return (
    <div className="h-full flex flex-col gap-5">
      <div className="h-[15%]">
        <DashboardCards cards={managerCards} />
      </div>
      <div className="h-[35%] flex gap-x-4 w-full">
        <SalesGraph />
        <div className="bg-white w-[45%] rounded-md">Content 2</div>
      </div>
      <div className="bg-white h-[45%] rounded-md">
        <div className=""></div>
      </div>
    </div>
  );
}
