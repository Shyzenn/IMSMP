"use client";

import React from "react";
import DashboardCards from "./DashboardCards";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { CardSkeleton } from "./Skeleton";
import { TbCurrencyPeso } from "react-icons/tb";
import { PiChartLineUpLight } from "react-icons/pi";
import { LuPackage } from "react-icons/lu";
import { TbCreditCardPay } from "react-icons/tb";

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
    return <CardSkeleton />;
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
      icon: TbCurrencyPeso,
      bgColor: "bg-blue-50",
      textColor: "text-blue-500",
      link: "/cashier_transaction?page=1&filter=all&sort=createdAt&order=desc",
    },
    {
      title: "Sales Today",
      value: `₱${Number(totalSalesToday).toLocaleString()}`,
      icon: PiChartLineUpLight,
      bgColor: "bg-orange-50",
      textColor: "text-orange-500",
      link: "/cashier_transaction?page=1&filter=all&sort=createdAt&order=desc",
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: LuPackage,
      bgColor: "bg-green-50",
      textColor: "text-green-500",
      link: "/cashier_transaction?page=1&filter=all&sort=createdAt&order=desc",
    },
    {
      title: "For Payment",
      value: forPayment,
      icon: TbCreditCardPay,
      bgColor: "bg-red-50",
      textColor: "text-red-500",
      link: "/cashier_transaction?page=1&filter=for_payment&sort=createdAt&order=desc",
    },
  ];

  return <DashboardCards cards={cashierCards} />;
};

export default CashierDashboardCards;
