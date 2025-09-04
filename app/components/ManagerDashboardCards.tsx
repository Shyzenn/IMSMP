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
import { CardSkeleton } from "./Skeleton";
import { useSession } from "next-auth/react";

const fetchManagerCardData = async () => {
  const { data } = await axios.get("api/manager/manager_card");
  return Array.isArray(data) ? data : [];
};

const ManagerDashboardCards = () => {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const { data: managerCard = [], isLoading } = useQuery({
    queryFn: fetchManagerCardData,
    queryKey: ["manager_cards"],
  });

  if (isLoading) {
    return <CardSkeleton />;
  }

  const [totalProducts, lowStockArray, highStockArray, expiring] = managerCard;

  const basePath =
    userRole === "Pharmacist_Staff" ? "pharmacist_inventory" : "inventory";

  const managerCards = [
    {
      title: "Product",
      value: totalProducts,
      icon: TbShoppingCart,
      bgColor: "bg-blue-50",
      textColor: "text-blue-500",

      link: `${basePath}?query=&page=1&filter=all&sort=releaseDate&order=desc`,
    },
    {
      title: "Low Stock",
      value: lowStockArray.length,
      icon: TbShoppingCartDown,
      bgColor: "bg-orange-50",
      textColor: "text-orange-500",
      link: `/${basePath}?query=&page=1&filter=all&sort=quantity&order=asc`,
    },
    {
      title: "High Stock",
      value: highStockArray.length,
      icon: TbShoppingCartUp,
      bgColor: "bg-green-50",
      textColor: "text-green-500",
      link: `/${basePath}?query=&page=1&filter=all&sort=quantity&order=desc`,
    },
    {
      title: "Expiring Soon",
      value: expiring,
      icon: TbShoppingCartX,
      bgColor: "bg-red-50",
      textColor: "text-red-500",
      link: `/${basePath}?query=&page=1&filter=all&sort=expiryDate&order=asc`,
    },
  ];

  return (
    <div className="h-[15%]">
      <DashboardCards cards={managerCards} />
    </div>
  );
};

export default ManagerDashboardCards;
