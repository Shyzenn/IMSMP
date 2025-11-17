"use client";

import React from "react";
import DashboardCards from "./DashboardCards";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { CardSkeleton } from "./Skeleton";
import {
  LuBadgeCheck,
  LuCircleX,
  LuClipboardList,
  LuPackageCheck,
} from "react-icons/lu";

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
      icon: LuClipboardList,
      bgColor: "bg-blue-50",
      textColor: "text-blue-500",
      link: "/medtech_transaction?page=1&filter=all&sort=createdAt&order=desc",
    },
    {
      title: "Total Approved Request",
      value: approvedRequest,
      icon: LuBadgeCheck,
      bgColor: "bg-green-50",
      textColor: "text-green-500",
      link: "/medtech_transaction?page=1&filter=approved&sort=createdAt&order=desc",
    },
    {
      title: "Total Declined Request",
      value: declinedRequest,
      icon: LuCircleX,
      bgColor: "bg-red-50",
      textColor: "text-red-500",
      link: "/medtech_transaction?page=1&filter=declined&sort=createdAt&order=desc",
    },
    {
      title: "Total Released Request",
      value: releasedRequest,
      icon: LuPackageCheck,
      bgColor: "bg-slate-50",
      textColor: "text-slate-500",
      link: "/medtech_transaction?page=1&filter=released&sort=createdAt&order=desc",
    },
  ];

  return <DashboardCards cards={medtechCards} />;
};

export default MTDashboardCards;
