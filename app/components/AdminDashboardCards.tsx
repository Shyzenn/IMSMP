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

type AdminCardsData = {
  totalUser: number;
  totalOnlineUser: number;
  totalOfflineUser: number;
  totalBanUser: number;
};

const fetchAdminCardData = async (): Promise<AdminCardsData> => {
  const { data } = await axios.get("api/admin/admin_cards");
  return data;
};

const AdminDashboardCards = () => {
  const { data: adminCards = {} as AdminCardsData, isLoading } = useQuery({
    queryFn: fetchAdminCardData,
    queryKey: ["admin_cards"],
  });

  if (isLoading) {
    return <CardSkeleton />;
  }

  const {
    totalUser = 0,
    totalOnlineUser = 0,
    totalOfflineUser = 0,
    totalBanUser = 0,
  } = adminCards;

  const cashierCards = [
    {
      title: "Total User",
      value: totalUser,
      icon: TbCurrencyPeso,
      bgColor: "bg-blue-50",
      textColor: "text-blue-500",
      link: "/cashier_transaction?page=1&filter=all&sort=createdAt&order=desc",
    },
    {
      title: "Online User",
      value: totalOnlineUser,
      icon: PiChartLineUpLight,
      bgColor: "bg-orange-50",
      textColor: "text-orange-500",
      link: "/cashier_transaction?page=1&filter=all&sort=createdAt&order=desc",
    },
    {
      title: "Offline User",
      value: totalOfflineUser,
      icon: LuPackage,
      bgColor: "bg-green-50",
      textColor: "text-green-500",
      link: "/cashier_transaction?page=1&filter=all&sort=createdAt&order=desc",
    },
    {
      title: "Banned User",
      value: totalBanUser,
      icon: TbCreditCardPay,
      bgColor: "bg-red-50",
      textColor: "text-red-500",
      link: "/cashier_transaction?page=1&filter=for_payment&sort=createdAt&order=desc",
    },
  ];

  return <DashboardCards cards={cashierCards} />;
};

export default AdminDashboardCards;
