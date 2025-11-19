"use client";

import React from "react";
import DashboardCards from "./DashboardCards";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { CardSkeleton } from "./Skeleton";
import { FaUsers } from "react-icons/fa";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { HiOutlineStatusOffline } from "react-icons/hi";
import { FaBan } from "react-icons/fa";

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
      icon: FaUsers,
      bgColor: "bg-blue-50",
      textColor: "text-blue-500",
      link: "/user_management",
    },
    {
      title: "Online User",
      value: totalOnlineUser,
      icon: HiOutlineStatusOnline,
      bgColor: "bg-green-50",
      textColor: "text-green-500",
      link: "/user_management",
    },
    {
      title: "Offline User",
      value: totalOfflineUser,
      icon: HiOutlineStatusOffline,
      bgColor: "bg-slate-50",
      textColor: "text-slate-500",
      link: "/user_management",
    },
    {
      title: "Banned User",
      value: totalBanUser,
      icon: FaBan,
      bgColor: "bg-red-50",
      textColor: "text-red-500",
      link: "/user_management",
    },
  ];

  return <DashboardCards cards={cashierCards} />;
};

export default AdminDashboardCards;
