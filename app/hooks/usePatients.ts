"use client";

import { useQuery } from "@tanstack/react-query";

export function usePatients() {
  return useQuery({
    queryKey: ["patient_order"],
    queryFn: async () => {
      const res = await fetch("/api/request_order/get_patients");

      if (!res.ok) {
        throw new Error("Failed to fetch patients");
      }

      return res.json();
    },
  });
}
