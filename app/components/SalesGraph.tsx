"use client";

import { Line } from "react-chartjs-2";
import { lineChartData } from "@/app/fake_data";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SalesGraph = () => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white w-[55%] rounded-md p-4">
      <Line options={options} data={lineChartData} className="w-full" />
    </div>
  );
};

export default SalesGraph;
