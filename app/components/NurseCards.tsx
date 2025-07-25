"use client";

import React from "react";
import DashboardCards from "./DashboardCards";
import { useQuery } from "@tanstack/react-query";
import {
  TbShoppingCart,
  TbShoppingCartDown,
  TbShoppingCartUp,
  TbShoppingCartX,
} from "react-icons/tb";
import axios from "axios";
import { ManagerCardSkeleton } from "./Skeleton";

const fetchNurseCards = async () => {
  const { data } = await axios.get("api/nurse_cards");
  return Array.isArray(data) ? data : [];
};

const NurseCards = () => {
  const { data: nurseCardsData = [], isLoading } = useQuery({
    queryFn: fetchNurseCards,
    queryKey: ["nurse_cards"],
  });

  if (isLoading) {
    return <ManagerCardSkeleton />;
  }

  const [totalOrders, pending, for_payment, paid] = nurseCardsData;

  const nurseCards = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: TbShoppingCart,
      bgColor: "bg-blue-50",
      textColor: "text-blue-500",
      link: "nurse_transaction?page=1&filter=all&sort=createdAt&order=desc",
    },
    {
      title: "Pending",
      value: pending,
      icon: TbShoppingCartDown,
      bgColor: "bg-orange-50",
      textColor: "text-orange-500",
      link: "nurse_transaction?page=1&filter=pending&sort=createdAt&order=desc",
    },
    {
      title: "For Payment",
      value: for_payment,
      icon: TbShoppingCartUp,
      bgColor: "bg-green-50",
      textColor: "text-green-500",
      link: "nurse_transaction?page=1&filter=for_payment&sort=createdAt&order=desc",
    },
    {
      title: "Paid",
      value: paid,
      icon: TbShoppingCartX,
      bgColor: "bg-red-50",
      textColor: "text-red-500",
      link: "nurse_transaction?page=1&filter=paid&sort=createdAt&order=desc",
    },
  ];

  return (
    <div className="h-[15%]">
      <DashboardCards cards={nurseCards} />
    </div>
  );
};

export default NurseCards;
