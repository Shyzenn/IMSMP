import React from "react";
import {
  TbShoppingCart,
  TbShoppingCartDown,
  TbShoppingCartUp,
  TbShoppingCartX,
} from "react-icons/tb";

const DashboardCards = () => {
  const dashboardCards = [
    {
      title: "Product",
      view: "view",
      value: "55",
      icon: <TbShoppingCart />,
      bgColor: "bg-blue-50",
      textColor: "text-blue-500",
    },
    {
      title: "Low Stock",
      view: "view",
      value: "55",
      icon: <TbShoppingCartDown />,
      bgColor: "bg-orange-50",
      textColor: "text-orange-500",
    },
    {
      title: "High Stock",
      view: "view",
      value: "55",
      icon: <TbShoppingCartUp />,
      bgColor: "bg-green-50",
      textColor: "text-green-500",
    },
    {
      title: "Expired",
      view: "view",
      value: "55",
      icon: <TbShoppingCartX />,
      bgColor: "bg-red-50",
      textColor: "text-red-500",
    },
  ];

  return (
    <div className="flex gap-5 h-full">
      {dashboardCards.map((dashboardCard) => {
        return (
          <div
            className="shadow-sm bg-white flex-1 py-2 px-3 flex flex-col justify-between rounded-md"
            key={dashboardCard.title}
          >
            <div className="flex items-center justify-between">
              <p className="text-xl">{dashboardCard.title}</p>
              <p>{dashboardCard.view}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-2xl">{dashboardCard.value}</p>
              <p
                className={`text-xl ${dashboardCard.bgColor} ${dashboardCard.textColor} p-2 rounded-md`}
              >
                {dashboardCard.icon}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardCards;
