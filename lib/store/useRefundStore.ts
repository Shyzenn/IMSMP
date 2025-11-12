import { create } from 'zustand';
import { CombinedTransaction } from '@/lib/action/get';
import { OrderItem } from '@/lib/interfaces';

interface RefundStore {
  transaction: CombinedTransaction | null;
  refundItems: OrderItem[];
  setTransaction: (transaction: CombinedTransaction | null) => void;
  setRefundItems: (items: OrderItem[]) => void;
}

export const useRefundStore = create<RefundStore>((set) => ({
  transaction: null,
  refundItems: [],
  setTransaction: (transaction) => set({ transaction }),
  setRefundItems: (items) => set({ refundItems: items }),
}));