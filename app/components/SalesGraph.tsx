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
import SalesGraphSkeleton from "./Skeleton";
import WidgetHeader from "./WidgetHeader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

const fetchSales = async (filter: string) => {
  const { data } = await axios.get("/api/request_order/sales", {
    params: { filter },
  });
  return Array.isArray(data) ? data : [];
};

const SalesGraph = ({ username }: { username: string }) => {
  const [filter, setFilter] = useState("This Year");

  const { data: salesData = [], isLoading } = useQuery({
    queryFn: () => fetchSales(filter),
    queryKey: ["salesData", filter],
  });

  if (isLoading) return <SalesGraphSkeleton />;

  const data = {
    labels: salesData.map((entry) => entry.date),
    datasets: [
      {
        label: "Sales",
        data: salesData.map((entry) => entry.totalSales),
        borderColor: "#11d695 ",
        backgroundColor: "rgba(103,255,153,0.1)",
        fill: true,
        tension: 0,
      },
    ],
    hoverRadius: 8,
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
        title="Sales"
        data={salesData.map((s) => ({ label: s.date, value: s.totalSales }))}
        reportType="sales"
        userName={username}
      />

      <div className="h-full">
        {salesData.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            No sales data available for this range.
          </p>
        ) : (
          <Line options={options} data={data} />
        )}
      </div>
    </div>
  );
};

export default SalesGraph;
