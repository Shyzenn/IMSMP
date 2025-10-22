"use client";

import React, { useEffect, useState } from "react";
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
import { ExpiryProductsSkeleton } from "./Skeleton";
import WidgetHeader from "./WidgetHeader";

ChartJS.register(ArcElement, Tooltip, Legend);

type SalesByOrderType = {
  name: string;
  revenue: number;
};

const fetchSalesByOrderType = async (
  filter: string
): Promise<SalesByOrderType[]> => {
  const { data } = await axios.get("/api/charts/order_type", {
    params: { filter },
  });
  return data;
};

const SalesByOrderTypePie = () => {
  const [filter, setFilter] = useState("This Year");

  const { data = [], isLoading } = useQuery({
    queryKey: ["salesByOrderType", filter],
    queryFn: () => fetchSalesByOrderType(filter),
  });

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        data: data.map((item) => item.revenue),
        backgroundColor: ["#3b82f6", "#10b981"],
        borderWidth: 1,
        borderThickness: 2,
      },
    ],
  };

  const [position, setPosition] = useState<"top" | "bottom" | "left" | "right">(
    "bottom"
  );
  const [radius, setRadius] = useState<string | number>("75%");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1300) {
        setPosition("right");
      } else {
        setPosition("top");
      }
      if (window.innerWidth <= 1023) {
        setPosition("right");
        setRadius("90%");
      } else {
        setPosition("top");
        setRadius("75%");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    radius,
    plugins: {
      legend: {
        position: position,
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
            const percent = ((value / totalRevenue) * 100).toFixed(1);
            return `${ctx.label}: ₱${value.toLocaleString()} (${percent}%)`;
          },
        },
      },
    },
  };

  if (isLoading) return <ExpiryProductsSkeleton />;

  return (
    <>
      <WidgetHeader
        filter={filter}
        setFilter={setFilter}
        title="Sales by Order Type"
        data={data.map((d) => ({ label: d.name, value: d.revenue }))}
        reportType="type"
      />

      <div className="p-2 w-full h-[325px] flex flex-col items-center justify-center overflow-hidden">
        {data.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            No sales data available for this range.
          </p>
        ) : (
          <div className="relative w-[95%] h-[95%]">
            <Doughnut options={options} data={chartData} />
          </div>
        )}
      </div>
    </>
  );
};

export default SalesByOrderTypePie;
