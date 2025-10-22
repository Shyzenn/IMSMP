"use client";

import React from "react";
import DashboardCards from "./DashboardCards";
import { useQuery } from "@tanstack/react-query";
import { LuPhilippinePeso } from "react-icons/lu";
import {
  TbShoppingCartDown,
  TbShoppingCartUp,
  TbShoppingCartX,
} from "react-icons/tb";
import axios from "axios";
import { CardSkeleton } from "./Skeleton";

const fetchManagerCardData = async () => {
  const { data } = await axios.get("api/manager/manager_card");
  return Array.isArray(data) ? data : [];
};

const ManagerDashboardCards = ({ userRole }: { userRole?: string }) => {
  const { data: managerCard = [], isLoading } = useQuery({
    queryFn: fetchManagerCardData,
    queryKey: ["manager_cards"],
  });

  if (isLoading) {
    return <CardSkeleton />;
  }

  const [totalSales, lowStock, highStock, expiring] = managerCard;

  const basePath =
    userRole === "Pharmacist_Staff"
      ? "pharmacist_inventory/products"
      : "inventory/products";

  const managerCards = [
    {
      title: "Sales",
      value: `₱${Number(totalSales).toLocaleString("en-PH", {
        minimumFractionDigits: 0,
      })}`,
      icon: LuPhilippinePeso,
      bgColor: "bg-blue-50",
      textColor: "text-blue-500",

      link: `/transaction?page=1&filter=all&sort=createdAt&order=desc`,
    },
    {
      title: "Low Stock",
      value: lowStock,
      icon: TbShoppingCartDown,
      bgColor: "bg-orange-50",
      textColor: "text-orange-500",
      link: `/${basePath}?query=&page=1&filter=all&sort=totalQuantity&order=asc`,
    },
    {
      title: "High Stock",
      value: highStock,
      icon: TbShoppingCartUp,
      bgColor: "bg-green-50",
      textColor: "text-green-500",
      link: `/${basePath}?query=&page=1&filter=all&sort=totalQuantity&order=desc`,
    },
    {
      title: "Expiring Soon",
      value: expiring,
      icon: TbShoppingCartX,
      bgColor: "bg-red-50",
      textColor: "text-red-500",
      link: `/inventory/batches?query=&page=1&filter=Expiring&sort=expiry_date&order=asc`,
    },
  ];

  return <DashboardCards cards={managerCards} />;
};

export default ManagerDashboardCards;
