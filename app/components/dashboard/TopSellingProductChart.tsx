"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import SalesGraphSkeleton from "../ui/Skeleton";
import WidgetHeader from "../ui/WidgetHeader";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type ProductSales = {
  name: string;
  quantity: number;
};

const fetchTopSelling = async (filter: string): Promise<ProductSales[]> => {
  const { data } = await axios.get("/api/product/top_sales", {
    params: { filter },
  });
  return data;
};

const TopSellingProducts = () => {
  const [filter, setFilter] = useState("This Year");

  const { data = [], isLoading } = useQuery({
    queryKey: ["topSellingProducts", filter],
    queryFn: () => fetchTopSelling(filter),
  });

  const topData = data.slice(0, 10);

  const chartData = {
    labels: topData.map((item) => item.name),
    datasets: [
      {
        label: "Quantity Sold",
        data: topData.map((item) => item.quantity),
        backgroundColor: "#11d695",
        barThickness: 10,
        borderRadius: 100,
        borderSkipped: "right" as const,
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
            return `${value.toLocaleString()} pcs`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(0,0,0,0.03)" },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.03)" },
        ticks: {
          callback: (value: string | number) => {
            if (typeof value === "number") {
              return `${value}`;
            }
            return value;
          },
        },
        title: {
          display: true,
          text: "Quantity Sold",
          font: { size: 13, weight: "bold" },
        },
      },
    },
  };

  if (isLoading) return <SalesGraphSkeleton />;

  return (
    <div className="bg-white w-full h-full rounded-md shadow-md flex flex-col">
      <WidgetHeader
        filter={filter}
        setFilter={setFilter}
        title="Top Selling Product"
        data={data.map((d) => ({ label: d.name, value: d.quantity }))}
        reportType="top selling product"
      />

      <div className="h-[25rem] p-2">
        {topData.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            No sales data available for this range.
          </p>
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default TopSellingProducts;
