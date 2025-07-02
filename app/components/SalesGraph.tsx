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
import SalesGraphSkeleton from "./Skeleton";
import SelectField from "./SelectField";
import { useState } from "react";

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
  totalRequested: number;
};

const fetchMostRequested = async (
  filter: string
): Promise<RequestedProduct[]> => {
  const { data } = await axios.get("/api/most_requested", {
    params: { filter },
  });
  return Array.isArray(data) ? data : [];
};

const SalesGraph = () => {
  const [filter, setFilter] = useState("Last 7 Days");

  const { data: most_requested = [], isLoading } = useQuery({
    queryFn: () => fetchMostRequested(filter),
    queryKey: ["most_requested", filter],
  });

  const sorted = [...most_requested]
    .sort((a, b) => b.totalRequested - a.totalRequested)
    .slice(0, 5);

  if (isLoading) return <SalesGraphSkeleton />;

  const labels = sorted.map((product) => product.name);
  const requestData = sorted.map((product) => product.totalRequested);

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
    <div className="bg-white w-full md:w-[60%] h-full rounded-md p-3 shadow-md flex flex-col">
      <div className="flex justify-between mb-2 w-full">
        <p className="text-lg font-semibold w-[100%]">
          Top 5 Most Requested Medicines
        </p>
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

export default SalesGraph;
