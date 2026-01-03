import { RequestView } from "@/app/components/medtech/MTRequestDetails";
import { create } from "zustand";

interface RequestModalState {
  isOpen: boolean;
  selectedRequest: RequestView | null;
  openModal: (order: RequestView) => void;
  closeModal: () => void;
}

export const useRequestModal = create<RequestModalState>((set) => ({
  isOpen: false,
  selectedRequest: null,
  openModal: (order) => set({ isOpen: true, selectedRequest: order }),
  closeModal: () => set({ isOpen: false, selectedRequest: null }),
}));
