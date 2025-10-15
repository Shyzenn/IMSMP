"use client";

import React, { useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  TooltipItem,
  ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import SalesGraphSkeleton from "./Skeleton";
import DateRangeSelector from "./WidgetHeader";

ChartJS.register(ArcElement, Tooltip, Legend);

type OrderTypeData = {
  type: "Regular" | "Emergency";
  count: number;
};

const fetchOrderTypes = async (filter: string): Promise<OrderTypeData[]> => {
  const { data } = await axios.get("/api/charts/request_order_type", {
    params: { filter },
  });
  return Array.isArray(data) ? data : [];
};

const OrderTypeDoughnutChart = () => {
  const [filter, setFilter] = useState("This Year");

  const { data = [], isLoading } = useQuery({
    queryKey: ["orderTypes", filter],
    queryFn: () => fetchOrderTypes(filter),
  });

  const totalOrders = data.reduce((sum, item) => sum + item.count, 0);

  const chartData = {
    labels: data.map((item) => item.type),
    datasets: [
      {
        data: data.map((item) => item.count),
        backgroundColor: ["#3b82f6", "#f87171"],
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    radius: "100%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 15,
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"doughnut">) => {
            const value = ctx.raw as number;
            const percent = ((value / totalOrders) * 100).toFixed(1);
            return `${ctx.label}: ${value} orders (${percent}%)`;
          },
        },
      },
    },
  };

  if (isLoading) return <SalesGraphSkeleton />;

  return (
    <>
      <DateRangeSelector
        filter={filter}
        setFilter={setFilter}
        title="Request Order Types"
        data={data.map((d) => ({ label: d.type, value: d.count }))}
        reportType="order type"
      />

      <div className="p-2 w-full h-[325px] flex flex-col items-center justify-center overflow-hidden">
        {data.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            No orders available for this range.
          </p>
        ) : (
          <div className="relative w-[100%] h-[100%] mt-10">
            <Doughnut options={options} data={chartData} />
          </div>
        )}
      </div>
    </>
  );
};

export default OrderTypeDoughnutChart;
