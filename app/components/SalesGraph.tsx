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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SalesGraph = () => {
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
      },
    },
  };

  const data = {
    labels: [
      "Paracetamol",
      "Amoxicillin",
      "Vitamin C Tablets",
      "Aspirin",
      "Ibuprofen Gel",
    ],
    datasets: [
      {
        label: "Requests",
        data: [98, 86, 74, 57, 29],
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
