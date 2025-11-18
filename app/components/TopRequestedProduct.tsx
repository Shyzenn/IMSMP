"use client";

import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import SalesGraphSkeleton from "./Skeleton";
import DateRangeSelector from "./WidgetHeader";
import { useSession } from "next-auth/react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type ProductData = {
  product: string;
  quantity: number;
};

const TopRequestedProducts = () => {
  const [filter, setFilter] = useState("This Year");
  const { data: session } = useSession();
  const userRole = session?.user.role;

  const userApi =
    userRole === "MedTech"
      ? "/api/charts/mt_top_requested"
      : "/api/charts/top_requested";

  const fetchTopProducts = async (filter: string): Promise<ProductData[]> => {
    const { data } = await axios.get(userApi, {
      params: { filter },
    });
    return Array.isArray(data) ? data : [];
  };

  const { data = [], isLoading } = useQuery({
    queryKey: ["topRequestedProducts", filter],
    queryFn: () => fetchTopProducts(filter),
  });

  if (isLoading) return <SalesGraphSkeleton />;

  const chartData = {
    labels: data.map((p) => p.product),
    datasets: [
      {
        label: "Requests",
        data: data.map((p) => p.quantity),
        backgroundColor: "#11d695",
        barThickness: 10,
        borderRadius: 100,
        borderSkipped: "left" as const,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw} requests`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      y: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="bg-white w-full rounded-md shadow-md flex flex-col">
      <DateRangeSelector
        filter={filter}
        setFilter={setFilter}
        title="Top 7 Requested Products"
        data={data.map((p) => ({
          label: p.product,
          value: p.quantity,
        }))}
        reportType="requested"
      />

      <div className="pb-4 w-full flex h-[325px] flex-col items-center justify-center overflow-hidden">
        {data.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            No product requests available for this range.
          </p>
        ) : (
          <div className="relative w-[95%] h-[100%] ">
            <Bar options={options} data={chartData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TopRequestedProducts;
