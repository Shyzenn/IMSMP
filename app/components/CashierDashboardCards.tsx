"use client";

import React from "react";
import {
  TbShoppingCart,
  TbShoppingCartDown,
  TbShoppingCartUp,
  TbShoppingCartX,
} from "react-icons/tb";
import DashboardCards from "./DashboardCards";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { ManagerCardSkeleton } from "./Skeleton";

const fetchOrderCardData = async () => {
  const { data } = await axios.get("api/request_order/sales_cards");
  return Array.isArray(data) ? data : [];
};

const CashierDashboardCards = () => {
  const { data: orderCard = [], isLoading } = useQuery({
    queryFn: fetchOrderCardData,
    queryKey: ["order_cards"],
    refetchInterval: 5000,
  });

  if (isLoading) {
    return <ManagerCardSkeleton />;
  }

  const [totalRevenue, totalSalesToday, totalOrders, forPayment] = orderCard;

  const cashierCards = [
    {
      title: "Total Revenue",
      value: `₱${Number(totalRevenue).toLocaleString()}`,
      icon: TbShoppingCart,
      bgColor: "bg-blue-50",
      textColor: "text-blue-500",
    },
    {
      title: "Sales Today",
      value: `₱${Number(totalSalesToday).toLocaleString()}`,
      icon: TbShoppingCartDown,
      bgColor: "bg-orange-50",
      textColor: "text-orange-500",
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: TbShoppingCartUp,
      bgColor: "bg-green-50",
      textColor: "text-green-500",
    },
    {
      title: "For Payment",
      value: forPayment,
      icon: TbShoppingCartX,
      bgColor: "bg-red-50",
      textColor: "text-red-500",
    },
  ];

  return (
    <div className="h-[15%]">
      <DashboardCards cards={cashierCards} />
    </div>
  );
};

export default CashierDashboardCards;
