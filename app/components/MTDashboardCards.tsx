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

type RequestCardData = {
  totalRequest: number;
  approvedRequest: number;
  declinedRequest: number;
  releasedRequest: number;
};

const fetchRequestCardData = async (): Promise<RequestCardData> => {
  const { data } = await axios.get("api/medtech_cards");
  return data;
};

const MTDashboardCards = () => {
  const { data: requestCard = {} as RequestCardData, isLoading } = useQuery({
    queryFn: fetchRequestCardData,
    queryKey: ["request_cards"],
  });

  if (isLoading) {
    return <CardSkeleton />;
  }

  const {
    totalRequest = 0,
    approvedRequest = 0,
    declinedRequest = 0,
    releasedRequest = 0,
  } = requestCard;

  const medtechCards = [
    {
      title: "Total Request",
      value: totalRequest,
      icon: TbCurrencyPeso,
      bgColor: "bg-blue-50",
      textColor: "text-blue-500",
      link: "/medtech_transaction?page=1&filter=all&sort=createdAt&order=desc",
    },
    {
      title: "Total Approved Request",
      value: approvedRequest,
      icon: PiChartLineUpLight,
      bgColor: "bg-orange-50",
      textColor: "text-orange-500",
      link: "/medtech_transaction?page=1&filter=all&sort=createdAt&order=desc",
    },
    {
      title: "Total Declined Request",
      value: declinedRequest,
      icon: LuPackage,
      bgColor: "bg-green-50",
      textColor: "text-green-500",
      link: "/medtech_transaction?page=1&filter=all&sort=createdAt&order=desc",
    },
    {
      title: "Total Released Request",
      value: releasedRequest,
      icon: TbCreditCardPay,
      bgColor: "bg-red-50",
      textColor: "text-red-500",
      link: "/medtech_transaction?page=1&filter=for_payment&sort=createdAt&order=desc",
    },
  ];

  return <DashboardCards cards={medtechCards} />;
};

export default MTDashboardCards;
