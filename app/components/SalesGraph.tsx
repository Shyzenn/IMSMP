"use client";

import React, { useState } from "react";
import SelectField from "./SelectField";
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

const SalesGraph = () => {
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
        fill: true,
        borderColor: "#339cff",
        backgroundColor: "rgba(51,156,255,0.1)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
    },
  };

  return (
    <div className="bg-white w-full md:w-[60%] h-full rounded-md p-3 shadow-md flex flex-col">
      <div className="flex justify-between mb-2 w-full">
        <p className="text-lg font-semibold">Sales</p>
        <SelectField
          label="Select a category"
          option={[
            { label: "Last 7 Days", value: "Last 7 Days" },
            { label: "This Month", value: "This Month" },
            { label: "This Year", value: "This Year" },
          ]}
          value={filter}
          onChange={(value) => setFilter(value)}
        />
      </div>

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
