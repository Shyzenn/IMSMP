"use client";

import React from "react";
import DashboardCards from "./DashboardCards";
import { useQuery } from "@tanstack/react-query";
import { PiPackageDuotone } from "react-icons/pi";
import { IoIosHourglass } from "react-icons/io";
import { MdOutlinePayment } from "react-icons/md";
import { MdPaid } from "react-icons/md";
import axios from "axios";
import { CardSkeleton } from "./Skeleton";

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
    return <CardSkeleton />;
  }

  const [totalOrders, pending, for_payment, paid] = nurseCardsData;

  const nurseCards = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: PiPackageDuotone,
      bgColor: "bg-blue-50",
      textColor: "text-blue-500",
      link: "nurse_transaction?page=1&filter=all&sort=createdAt&order=desc",
    },
    {
      title: "Pending",
      value: pending,
      icon: IoIosHourglass,
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-500",
      link: "nurse_transaction?page=1&filter=pending&sort=createdAt&order=desc",
    },
    {
      title: "For Payment",
      value: for_payment,
      icon: MdOutlinePayment,
      bgColor: "bg-orange-50",
      textColor: "text-orange-500",
      link: "nurse_transaction?page=1&filter=for_payment&sort=createdAt&order=desc",
    },
    {
      title: "Paid",
      value: paid,
      icon: MdPaid,
      bgColor: "bg-green-50",
      textColor: "text-green-500",
      link: "nurse_transaction?page=1&filter=paid&sort=createdAt&order=desc",
    },
  ];

  return <DashboardCards cards={nurseCards} />;
};

export default NurseCards;
