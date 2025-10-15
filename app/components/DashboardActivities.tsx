"use client";

import { useState } from "react";
import Pagination from "./Pagination";
import SelectField from "./SelectField";
import { FaShoppingCart, FaBox } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { RiWalkLine } from "react-icons/ri";
import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExpiryProductsSkeleton } from "./Skeleton";

export type FilterOption = "All" | "Today" | "Yesterday" | "Last 7 days";

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
}

export interface AuditLog {
  id: number;
  userId: string;
  action: string;
  entityType: string;
  entityId?: number | null;
  description?: string | null;
  createdAt: string;
  user: User;
}

interface AuditLogProps {
  role: "manager" | "nurse";
  entityType?: string;
}

async function fetchLogs(
  role: "manager" | "nurse",
  filter: FilterOption,
  page: number,
  entityType?: string
) {
  const url =
    role === "manager"
      ? `/api/manager/recent_activities?filter=${filter}&page=${page}${
          entityType ? `&entityType=${entityType}` : ""
        }`
      : `/api/request_order/audit-log?filter=${filter}&page=${page}${
          entityType ? `&entityType=${entityType}` : ""
        }`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch logs");
  return res.json() as Promise<{ logs: AuditLog[]; total: number }>;
}

export default function DashboardAuditLog({ role, entityType }: AuditLogProps) {
  const [filter, setFilter] = useState<FilterOption>("All");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery<
    { logs: AuditLog[]; total: number },
    Error
  >({
    queryKey: ["auditLog", role, filter, page, entityType],
    queryFn: () => fetchLogs(role, filter, page, entityType),
    placeholderData: (prev) => prev,
    staleTime: 60 * 1000,
  });

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;

  if (isLoading) return <ExpiryProductsSkeleton />;
  if (isError) return <p>Something went wrong</p>;

  return (
    <div className="py-2">
      <div className="px-4 flex justify-between items-center mb-4 border-b pb-4">
        <p className="text-lg font-semibold">Recent Activities</p>
        <div>
          <SelectField
            label={filter}
            option={[
              { label: "All", value: "All" },
              { label: "Today", value: "Today" },
              { label: "Yesterday", value: "Yesterday" },
              { label: "Last 7 days", value: "Last 7 days" },
            ]}
            value={filter}
            onChange={(val) => {
              setPage(1);
              setFilter(val as FilterOption);
            }}
          />
        </div>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {logs.length > 0 ? (
          <>
            {logs.map((log) => {
              const { icon } = getEntityMeta(log.entityType);
              return (
                <div key={log.id} className="border-b pb-4 border-dashed">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-100 w-11 h-12 flex justify-center items-center rounded-sm">
                      {icon}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold">
                        {new Date(log.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        - {new Date(log.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-[12px] text-gray-600 font-semibold">
                        {log.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold">{logs.length}</span> of{" "}
                <span className="font-semibold">{total}</span> Results
              </p>
              <Pagination
                totalPages={Math.ceil(total / 10)}
                currentPage={page}
                onPageChange={(newPage) => setPage(newPage)}
                isComponent={true}
              />
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500 text-sm">
            No recent activities
          </p>
        )}
      </div>
    </div>
  );
}

export function getEntityMeta(entityType: string): {
  icon: ReactNode;
  label: string;
} {
  switch (entityType.toUpperCase()) {
    case "PRODUCT":
      return {
        icon: <FaBox className="text-xl text-slate-500" />,
        label: "Product",
      };
    case "ORDER_REQUEST":
      return {
        icon: <FaShoppingCart className="text-xl text-slate-500" />,
        label: "Order Request",
      };
    case "WALKIN_ORDER":
      return {
        icon: <RiWalkLine className="text-xl text-slate-500" />,
        label: "Walkin Order",
      };
    case "CHANGE_PASSWORD":
      return {
        icon: <MdPassword className="text-xl text-slate-500" />,
        label: "Change Password",
      };
    default:
      return {
        icon: <FaShoppingCart className="text-xl text-slate-500" />,
        label: "Other",
      };
  }
}
