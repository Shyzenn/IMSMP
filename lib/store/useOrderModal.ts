import { create } from "zustand";
import { OrderView } from "../interfaces";

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
