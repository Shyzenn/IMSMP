import { OrderView } from "@/app/components/transaction/cashier/CashierAction";
import { create } from "zustand";

interface OrderModalState {
  isOpen: boolean;
  selectedOrder: OrderView | null;
  openModal: (order: OrderView) => void;
  closeModal: () => void;
}

export const useOrderModal = create<OrderModalState>((set) => ({
  isOpen: false,
  selectedOrder: null,
  openModal: (order) => set({ isOpen: true, selectedOrder: order }),
  closeModal: () => set({ isOpen: false, selectedOrder: null }),
}));
