import { WalkInPaymentSchema } from "@/lib/types";
import { z } from "zod";
import { api } from "./api";

type PaymentPayload = z.infer<typeof WalkInPaymentSchema>;

export const paymentServices = {
  submitWalkInPayment: async (payload: PaymentPayload) => {
    const { data } = await api.post("api/walkin_order", payload);
    return data;
  },
};
