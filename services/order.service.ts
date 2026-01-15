import {
  TAddMedTechRequestSchema,
  TAddRequestOrderSchema,
  TEditMedTechRequestSchema,
  TEditRequestOrderSchema,
  WalkInPaymentSchema,
} from "@/lib/types";
import { z } from "zod";
import { api } from "./api/client";
import { request } from "./api/request";

type PaymentPayload = z.infer<typeof WalkInPaymentSchema>;

type OrderResponse = {
  success: boolean;
};

export const orderService = {
  addWalkInOrder: (payload: PaymentPayload) =>
    request<OrderResponse>(api.post("/api/walkin_order", payload)),

  addOrderRequestOrder: (payload: TAddRequestOrderSchema) =>
    request<OrderResponse>(api.post("/api/request_order", payload)),

  editOrderRequestOrder: (payload: TEditRequestOrderSchema, id: string) =>
    request<OrderResponse>(
      api.patch(`/api/request_order/${id}/update`, payload)
    ),

  addMedtechRequestOrder: (payload: TAddMedTechRequestSchema) =>
    request<OrderResponse>(api.post("/api/medtech_request", payload)),

  editMedtechRequestOrder: (payload: TEditMedTechRequestSchema, id: string) =>
    request<OrderResponse>(
      api.patch(`/api/medtech_request/${id}/update`, payload)
    ),
};
