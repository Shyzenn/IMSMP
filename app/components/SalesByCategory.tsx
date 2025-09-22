"use client";

import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import SelectField from "./SelectField";
import { ExpiryProductsSkeleton } from "./Skeleton";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type SalesByCategory = {
  name: string;
  revenue: number;
};

const fetchSalesByCategory = async (
  filter: string
): Promise<SalesByCategory[]> => {
  const { data } = await axios.get("/api/product/category/sales", {
    params: { filter },
  });
  return data;
};

const SalesByCategoryBar = () => {
  const [filter, setFilter] = useState("This Year");

  const { data = [], isLoading } = useQuery({
    queryKey: ["salesByCategory", filter],
    queryFn: () => fetchSalesByCategory(filter),
  });

  const limitedData = data.sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  const chartData = {
    labels: limitedData.map((item) => item.name),
    datasets: [
      {
        label: "Revenue (₱)",
        data: limitedData.map((item) => item.revenue),
        backgroundColor: "#3b82f6",
        borderRadius: 6,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"bar">) => {
            const value = ctx.raw as number;
            return `₱${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => {
            if (typeof value === "number") {
              return `₱${value.toLocaleString()}`;
            }
            return value;
          },
        },
      },
    },
  };

  if (isLoading) return <ExpiryProductsSkeleton />;

  return (
    <>
      <div className="flex justify-between p-2 w-full">
        <p className="text-lg font-semibold">Sales By Category (₱)</p>
        <SelectField
          label="Select a range"
          option={[
            { label: "Last 7 Days", value: "Last 7 Days" },
            { label: "This Month", value: "This Month" },
            { label: "This Year", value: "This Year" },
          ]}
          defaultValue={filter}
          value={filter}
          onChange={(value) => setFilter(value)}
        />
      </div>

      <div className="p-2 w-full h-[325px]">
        {data.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            No sales data available for this range.
          </p>
        ) : (
          <Bar options={options} data={chartData} />
        )}
      </div>
    </>
  );
};

export default SalesByCategoryBar;
