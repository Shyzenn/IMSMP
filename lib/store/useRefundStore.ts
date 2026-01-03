import { create } from "zustand";
import { OrderView } from "@/lib/interfaces";

interface RefundItem {
  productName: string;
  quantity: number;
}

interface RefundState {
  transaction: OrderView | null;
  refundItems: RefundItem[];
  setTransaction: (transaction: OrderView | null) => void;
  setRefundItems: (items: RefundItem[]) => void;
}

export const useRefundStore = create<RefundState>((set) => ({
  transaction: null,
  refundItems: [],
  setTransaction: (transaction) => set({ transaction }),
  setRefundItems: (items) => set({ refundItems: items }),
}));
