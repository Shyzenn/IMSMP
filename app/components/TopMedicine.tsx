"use client";

import React, { useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import SelectField from "./SelectField";
import { ExpiryProductsSkeleton } from "./Skeleton";

ChartJS.register(ArcElement, Tooltip, Legend);

type TopSelling = {
  name: string;
  quantity: number;
};

const fetchTopSelling = async (filter: string): Promise<TopSelling[]> => {
  const { data } = await axios.get("/api/request_order/sales/top-selling", {
    params: { filter },
  });
  return data;
};

const TopMedicine = () => {
  const [filter, setFilter] = useState("This Year");

  const { data = [], isLoading } = useQuery({
    queryKey: ["topSellingMedicine", filter],
    queryFn: () => fetchTopSelling(filter),
  });

  // Prepare chart data
  const labels = data.map((item) => item.name);
  const quantities = data.map((item) => item.quantity);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Quantity Sold",
        data: quantities,
        backgroundColor: [
          "#06b6d4", // teal
          "#3b82f6", // blue
          "#8b5cf6", // purple
          "#ec4899", // pink
          "#f59e0b", // orange
          "#fde047", // yellow
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          boxWidth: 12,
          padding: 20,
        },
      },
    },
  };

  if (isLoading) return <ExpiryProductsSkeleton />;

  return (
    <>
      <div className="flex justify-between p-2 w-full h-auto">
        <p className="text-lg font-semibold">Top Selling Medicine</p>
        <SelectField
          label="Select a category"
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

      <div className="h-[60%] mt-4 pr-20">
        {data.length === 0 ? (
          <p className="text-center text-gray-500 mt-2">No Data Available</p>
        ) : (
          <Doughnut options={options} data={chartData} />
        )}
      </div>
    </>
  );
};

export default TopMedicine;
