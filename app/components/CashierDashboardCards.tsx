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

type OrderCardData = {
  totalRevenue: number;
  totalSalesToday: number;
  totalOrders: number;
  forPayment: number;
};

const fetchOrderCardData = async (): Promise<OrderCardData> => {
  const { data } = await axios.get("api/request_order/sales_cards");
  return data;
};

const CashierDashboardCards = () => {
  const { data: orderCard = {} as OrderCardData, isLoading } = useQuery({
    queryFn: fetchOrderCardData,
    queryKey: ["order_cards"],
    refetchInterval: 5000,
  });

  if (isLoading) {
    return <ManagerCardSkeleton />;
  }

  const {
    totalRevenue = 0,
    totalSalesToday = 0,
    totalOrders = 0,
    forPayment = 0,
  } = orderCard;

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
