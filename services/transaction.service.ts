import { OrderView } from "@/lib/interfaces";
import { api } from "./api/client";

export type GetTransactionResponse = {
  data: OrderView[];
  meta: {
    totalTransaction: number;
    totalPages: number;
    currentPage: number;
  };
};

export const transactionService = {
  getTransaction: async (params: {
    query: string;
    page: number;
    filter: string;
    sortBy: string;
    sortOrder: string;
    to: string;
    from: string;
  }): Promise<GetTransactionResponse> => {
    const res = await api.get("/api/transaction", { params });
    return res.data;
  },

  getTransactionPages: async (params: {
    query: string;
    filter: string;
    from: string;
    to: string;
  }): Promise<{ totalPages: number; totalTransaction: number }> => {
    const res = await api.get("/api/transaction/pages", { params });
    return res.data;
  },
};
