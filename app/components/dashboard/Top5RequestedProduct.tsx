"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import SalesGraphSkeleton from "../ui/Skeleton";
import SelectField from "../ui/SelectField";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type RequestedProduct = {
  name: string;
  quantity: number;
};

const fetchMostRequested = async (
  filter: string
): Promise<RequestedProduct[]> => {
  const { data } = await axios.get("/api/most_requested", {
    params: { filter },
  });
  return Array.isArray(data) ? data : [];
};

const Top5RequestedProducts = () => {
  const [filter, setFilter] = useState("Last 7 Days");

  const { data: most_requested = [], isLoading } = useQuery({
    queryFn: () => fetchMostRequested(filter),
    queryKey: ["most_requested", filter],
  });

  const sorted = [...most_requested]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const labels = sorted.map((product) => product.name);
  const requestData = sorted.map((product) => product.quantity);

  if (isLoading) return <SalesGraphSkeleton />;

  const data = {
    labels,
    datasets: [
      {
        label: "Requests",
        data: requestData,
        backgroundColor: [
          "#007bff",
          "#339cff",
          "#66baff",
          "#99d8ff",
          "#ccecff",
        ],
        borderRadius: 5,
        barThickness: 20,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
    },
  };

  return (
    <div className="bg-white w-full h-full rounded-md shadow-md flex flex-col p-4">
      <div className="flex justify-between mb-2 w-full">
        <p className="text-lg font-semibold w-[100%]">
          Top 5 Most Requested Medicines
        </p>
        <div className="w-[18%]">
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
      </div>

      <div className="h-full">
        {sorted.length === 0 ? (
          <p className="text-center text-gray-500 mt-2">No Data Available</p>
        ) : (
          <Bar options={options} data={data} />
        )}
      </div>
    </div>
  );
};

export default Top5RequestedProducts;
