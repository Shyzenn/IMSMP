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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const fetchMostRequested = async () => {
  const { data } = await axios.get("api/most_requested");
  return Array.isArray(data) ? data : [];
};

const SalesGraph = () => {
  const {
    data: most_requested = [],
    isLoading,
    isError,
  } = useQuery({
    queryFn: fetchMostRequested,
    queryKey: ["most_requested"],
  });

  const labels = most_requested.map((product) => product.name);
  const requestData = most_requested.map((product) => product.totalRequested);

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
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  if (isLoading) return <p>Loading products...</p>;
  if (isError) return <p>Failed to load products.</p>;

  return (
    <div className="bg-white w-[60%] rounded-md p-3">
      <p className="text-lg font-semibold mb-2">
        Top 5 most requested medicine
      </p>
      <div className="h-[85%]">
        <Bar options={options} data={data} className="w-full" />
      </div>
    </div>
  );
};

export default SalesGraph;
