"use client";

import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useQuery } from "@tanstack/react-query";
import SalesGraphSkeleton from "../ui/Skeleton";
import WidgetHeader from "../ui/WidgetHeader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

const SalesGraph = ({
  username,
  userRole,
}: {
  username: string;
  userRole?: string;
}) => {
  const [filter, setFilter] = useState("This Year");

  const apiRole =
    userRole === "MedTech"
      ? "/api/charts/mt_request_trends"
      : "/api/request_order/sales";

  const fetchSales = async (filter: string) => {
    const { data } = await axios.get(apiRole, {
      params: { filter },
    });
    return Array.isArray(data) ? data : [];
  };

  const { data: salesData = [], isLoading } = useQuery({
    queryFn: () => fetchSales(filter),
    queryKey: ["salesData", filter],
  });

  if (isLoading) return <SalesGraphSkeleton />;
  const isMedTech = userRole === "MedTech";

  const data = isMedTech
    ? {
        labels: salesData.map((entry) => entry.date),
        datasets: [
          {
            label: "Total Requests",
            data: salesData.map((entry) => entry.total),
            borderColor: "#11d695",
            backgroundColor: "rgba(103,255,153,0.1)",
            fill: true,
            tension: 0,
          },
        ],
      }
    : {
        labels: salesData.map((entry) => entry.date),
        datasets: [
          {
            label: "Sales",
            data: salesData.map((entry) => entry.totalSales),
            borderColor: "#11d695",
            backgroundColor: "rgba(103,255,153,0.1)",
            fill: true,
            tension: 0,
          },
        ],
      };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 10,
        right: 10,
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(0,0,0,0.03)",
        },
      },
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: {
          color: "rgba(0,0,0,0.03)",
        },
      },
    },
  };

  return (
    <div className="bg-white w-full h-full rounded-md shadow-md flex flex-col">
      <WidgetHeader
        filter={filter}
        setFilter={setFilter}
        title={isMedTech ? "Request Trends" : "Sales"}
        data={salesData.map((s) => ({ label: s.date, value: s.totalSales }))}
        reportType="sales"
        userName={username}
      />

      <div className="h-full">
        {salesData.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            {isMedTech
              ? "No request data available for this range."
              : "No sales data available for this range."}
          </p>
        ) : (
          <Line options={options} data={data} />
        )}
      </div>
    </div>
  );
};

export default SalesGraph;
