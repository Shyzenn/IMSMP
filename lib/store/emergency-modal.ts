import { create } from "zustand";
import { EmergencyOrderModalData } from "../interfaces";

interface EmergencyModalState {
  isOpen: boolean;
  orderData: EmergencyOrderModalData | null;
  openModal: (data: EmergencyOrderModalData) => void;
  closeModal: () => void;
}

export const useEmergencyModal = create<EmergencyModalState>((set) => ({
  isOpen: false,
  orderData: null,
  openModal: (data) => {
    console.log("🧠 Opening modal with data:", data);
    set({ isOpen: true, orderData: data });
  },
  closeModal: () => {
    console.log("🧠 Closing modal");
    set({ isOpen: false, orderData: null });
  },
}));

