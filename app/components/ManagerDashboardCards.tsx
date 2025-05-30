"use client";

import React from "react";
import DashboardCards from "./DashboardCards";
import { fetchManagerCardData } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  TbShoppingCart,
  TbShoppingCartDown,
  TbShoppingCartUp,
  TbShoppingCartX,
} from "react-icons/tb";

const ManagerDashboardCards = () => {
  const {
    data: managerCard = [],
    isLoading,
    isError,
  } = useQuery({
    queryFn: fetchManagerCardData,
    queryKey: ["manager_cards"],
  });

  if (isLoading) return <p>Loading data...</p>;
  if (isError) return <p>Failed to load data.</p>;

  const [totalProducts, lowStockArray, highStockArray, expiring] = managerCard;

  const managerCards = [
    {
      title: "Product",
      value: totalProducts,
      icon: TbShoppingCart,
      bgColor: "bg-blue-50",
      textColor: "text-blue-500",
    },
    {
      title: "Low Stock",
      value: lowStockArray.length,
      icon: TbShoppingCartDown,
      bgColor: "bg-orange-50",
      textColor: "text-orange-500",
    },
    {
      title: "High Stock",
      value: highStockArray.length,
      icon: TbShoppingCartUp,
      bgColor: "bg-green-50",
      textColor: "text-green-500",
    },
    {
      title: "Expiry",
      value: expiring,
      icon: TbShoppingCartX,
      bgColor: "bg-red-50",
      textColor: "text-red-500",
    },
  ];

  return (
    <div className="h-[15%]">
      <DashboardCards cards={managerCards} />
    </div>
  );
};

export default ManagerDashboardCards;
