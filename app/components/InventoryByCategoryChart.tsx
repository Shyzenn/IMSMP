"use client";

import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
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
import { useQuery } from "@tanstack/react-query";
import SalesGraphSkeleton from "./Skeleton";
import DateRangeSelector from "./WidgetHeader";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const fetchInventory = async (filter: string) => {
  const { data } = await axios.get("/api/product/category_chart", {
    params: { filter },
  });
  return Array.isArray(data) ? data : [];
};

const InventoryByCategoryChart = () => {
  const [filter, setFilter] = useState("This Year");

  const { data: inventoryData = [], isLoading } = useQuery({
    queryFn: () => fetchInventory(filter),
    queryKey: ["inventoryByCategory", filter],
  });

  if (isLoading) return <SalesGraphSkeleton />;

  const topData = inventoryData.slice(0, 10);

  const data = {
    labels: topData.map((entry) => entry.category),
    datasets: [
      {
        label: "Stock",
        data: topData.map((entry) => entry.stock),
        borderSkipped: "right" as const,
        backgroundColor: "#11d695",
        barThickness: 12,
        borderRadius: 6,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "x",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"bar">) => {
            const value = ctx.raw as number;
            return `${value.toLocaleString()} units`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.03)" },
        ticks: {
          precision: 0,
        },
      },
      y: {
        grid: { color: "rgba(0,0,0,0.03)" },
      },
    },
  };

  return (
    <div className="bg-white w-full h-full rounded-md shadow-md flex flex-col">
      <DateRangeSelector
        filter={filter}
        setFilter={setFilter}
        title="Inventory Levels by Category"
        data={topData.map((entry) => ({
          label: entry.category,
          value: entry.stock,
        }))}
        reportType="inventory by category"
      />

      <div className="h-full p-4">
        {inventoryData.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            No inventory data available.
          </p>
        ) : (
          <Bar options={options} data={data} />
        )}
      </div>
    </div>
  );
};

export default InventoryByCategoryChart;
