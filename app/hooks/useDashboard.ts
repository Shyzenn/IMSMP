"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useDashboard(filter: string) {
  return useQuery({
    queryKey: ["dashboard", filter],
    queryFn: async () => {
        const { data } = await axios.get("/api/manager_dashboard", {
            params: { filter }, 
        });
        return data;
        },
    staleTime: 60_000, // cache for 1 min
  });
}
