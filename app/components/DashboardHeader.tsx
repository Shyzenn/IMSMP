"use client";

import { capitalLetter, expiryDate } from "@/lib/utils";
import { Session } from "next-auth";
import React, { useEffect, useState } from "react";
import AddProductForm from "./Inventory/products/AddProductform";
import { CiWarning } from "react-icons/ci";
import { FaCheckDouble } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import RequestOrderBtn from "./RequestOrderBtn";
import WalkInOrder from "./WalkInOrder";
import Link from "next/link";

function getGreeting() {
  const now = new Date();
  const hour = now.getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

interface expiringProps {
  batchNumber: number;
}

interface alertsProps extends expiringProps {
  productName: string;
  quantity: number;
  expiryDate: string;
}

interface AlertItem {
  message: string;
  link: string;
}

const DashboardHeader = ({ session }: { session: Session | null }) => {
  const greeting = getGreeting();
  const name = session?.user?.username;
  const role = session?.user?.role;

  const batchBasePath =
    role === "Manager"
      ? "/inventory/"
      : role === "Pharmacist_Staff"
      ? "/pharmacist_inventory/"
      : role === "Nurse"
      ? "/nurse_inventory/"
      : "/cashier_inventory/";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const {
    data: alerts = [],
    isLoading,
    error,
  } = useQuery<AlertItem[]>({
    queryKey: ["alerts"],
    queryFn: async () => {
      const res = await fetch("/api/product/alerts");
      if (!res.ok) throw new Error("Failed to fetch alerts");

      const data = await res.json();

      // Low stock alerts
      const lowStockAlerts = data.lowStock.map((p: alertsProps) => ({
        message: `${capitalLetter(p.productName)} is ${p.quantity} stock left!`,
        link: `${batchBasePath}products?query=${p.productName}&page=1&filter=all&sort=totalQuantity&order=asc`,
      }));

      // Expiring batch alerts
      const expiringAlerts = data.expiringBatches
        .filter((b: alertsProps) => b.quantity > 0)
        .map((b: alertsProps) => ({
          message: `${capitalLetter(b.productName)} batch ${
            b.batchNumber
          } expires in ${expiryDate(b.expiryDate)} days`,
          link: `${batchBasePath}batches?query=${b.productName}&page=1&filter=all&sort=expiry_date&order=asc`,
        }));

      return [...lowStockAlerts, ...expiringAlerts].slice(0, 5);
    },
  });

  // Restart animation key whenever alerts change
  useEffect(() => {
    if (alerts.length > 0) {
      setAnimKey((prev) => prev + 1);
    }
  }, [alerts]);

  // Rotate message every 5 seconds
  useEffect(() => {
    if (alerts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [alerts]);

  return (
    <div className="lg:flex lg:justify-between bg-white p-8 shadow-md items-center rounded-md">
      {/* Greeting */}
      <div className="mb-2 lg:mb-0">
        <p className="font-semibold text-gray-700">
          {greeting}, {capitalLetter(name)}
        </p>
        <p className="text-sm text-gray-500">
          Here&apos;s what&apos;s happening with the pharmacy store today.
        </p>
      </div>

      {/* Alerts + Add Button */}
      {role !== "Cashier" && role !== "MedTech" ? (
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          {isLoading ? (
            <div className="bg-gray-100 px-8 py-[22px] rounded-md md:w-[25rem] animate-pulse w-full"></div>
          ) : error ? (
            <div className="bg-red-100 px-8 py-3 rounded-md w-[25rem]">
              <p className="text-sm text-red-500">Failed to load alerts</p>
            </div>
          ) : alerts.length > 0 ? (
            <div className="bg-orange-100 flex gap-2 px-8 py-3 rounded-md md:w-[25rem] w-full">
              <CiWarning className="text-orange-500 text-xl" />
              {role !== "Cashier" ? (
                <Link
                  key={animKey}
                  href={alerts[currentIndex].link}
                  className="text-sm text-amber-700 hover:text-amber-800 transition-colors slow-blink"
                >
                  {alerts[currentIndex].message}
                </Link>
              ) : (
                <>
                  {/** Not Link **/}
                  <p
                    key={animKey}
                    className="text-sm text-amber-700 slow-blink"
                  >
                    {alerts[currentIndex].message}
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="bg-green-100 flex gap-2 px-8 py-3 rounded-md w-[28rem] items-center">
              <FaCheckDouble className="text-sm text-green-500" />
              <p className="text-sm">
                Product stock levels are stable — nothing to worry about.
              </p>
            </div>
          )}

          {(role === "Pharmacist_Staff" || role === "Manager") && (
            <div>
              <AddProductForm />
            </div>
          )}
          {role === "Pharmacist_Staff" && (
            <div className="md:hidden">
              <WalkInOrder />
            </div>
          )}
          {role === "Nurse" && (
            <div>
              <RequestOrderBtn />
            </div>
          )}
        </div>
      ) : null}

      {role === "MedTech" && (
        <div>
          <RequestOrderBtn />
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
